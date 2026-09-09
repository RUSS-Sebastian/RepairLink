package com.repairlink.backend.appointment.service;

import com.repairlink.backend.appointment.dto.AppointmentDetailResponse;
import com.repairlink.backend.appointment.entity.Appointment;
import com.repairlink.backend.appointment.entity.AppointmentStatus;
import com.repairlink.backend.appointment.repository.AppointmentRepository;
import com.repairlink.backend.loyalty.service.CustomerLoyaltyService;
import com.repairlink.backend.notification.entity.NotificationType;
import com.repairlink.backend.notification.service.NotificationService;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.serviceRequest.entity.ServiceRequest;
import com.repairlink.backend.serviceRequest.entity.ServiceRequestPhoto;
import com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus;
import com.repairlink.backend.serviceRequest.repository.ServiceRequestRepository;
import com.repairlink.backend.vehicle.entity.Vehicle;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final NotificationService notificationService;
    private final CustomerLoyaltyService loyaltyService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            ServiceRequestRepository serviceRequestRepository,
            NotificationService notificationService,
            CustomerLoyaltyService loyaltyService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.notificationService = notificationService;
        this.loyaltyService = loyaltyService;
    }

    @Transactional
    public AppointmentDetailResponse confirmAppointmentByStaff(UUID serviceRequestId, String staffUsername) {
        ServiceRequest req = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Service request not found: " + serviceRequestId));

        if (req.getStatus() == ServiceRequestStatus.CANCELLED || req.getStatus() == ServiceRequestStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot confirm an appointment for a closed or cancelled service request.");
        }

        if (req.getStatus() == ServiceRequestStatus.APPOINTMENT_SCHEDULED) {
            throw new IllegalStateException("This service request has already been confirmed and scheduled by a staff member.");
        }

        if (req.getStatus() == ServiceRequestStatus.COMPLETED) {
            throw new IllegalArgumentException("This service request has already been completed.");
        }

        // Check if appointment already exists
        Optional<Appointment> existingOpt = appointmentRepository.findByServiceRequest_ServiceRequestId(serviceRequestId);
        if (existingOpt.isPresent() && existingOpt.get().getStatus() == AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("An active appointment (" + existingOpt.get().getAppointmentCode() + ") has already been confirmed for this request.");
        }

        String aptCode = appointmentRepository.getNextAppointmentCode();
        Appointment appointment = existingOpt.orElseGet(Appointment::new);
        appointment.setAppointmentCode(aptCode);
        appointment.setServiceRequest(req);
        appointment.setCustomer(req.getCustomer());
        appointment.setVehicle(req.getVehicle());
        appointment.setAppointmentDate(req.getPreferredDate());
        appointment.setTimeSlot(req.getPreferredTimeSlot());
        appointment.setHandoverMethod(req.getHandoverMethod());
        appointment.setPickupLocation(req.getPickupLocation());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setConfirmedBy(staffUsername != null ? staffUsername : "STAFF");
        appointment.setUpdatedAt(Instant.now());
        appointment = appointmentRepository.save(appointment);

        // Update service request status to APPOINTMENT_SCHEDULED
        req.setStatus(ServiceRequestStatus.APPOINTMENT_SCHEDULED);
        req.setUpdatedAt(Instant.now());
        serviceRequestRepository.save(req);

        // Notify customer in real time over WebSocket & save customer notification
        try {
            UserAccount customer = req.getCustomer();
            Vehicle vehicle = req.getVehicle();
            String vehicleName = vehicle != null
                    ? (vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel())
                    : "vehicle";

            String notiTitle = "Appointment Confirmed";
            String notiMessage = "Your appointment " + appointment.getAppointmentCode() + " for " + vehicleName +
                    " on " + appointment.getAppointmentDate() + " (" + appointment.getTimeSlot() + ") has been confirmed by RepairLink.";

            notificationService.createAndSendCustomerNotification(
                    customer,
                    notiTitle,
                    notiMessage,
                    NotificationType.APPOINTMENT_CONFIRMED,
                    appointment.getAppointmentId(),
                    appointment.getAppointmentCode()
            );
        } catch (Exception ignored) {
        }

        // Broadcast to all staff members so their active views update in real-time
        try {
            notificationService.createAndBroadcastStaffNotification(
                    "Appointment Confirmed",
                    "Staff confirmed appointment " + appointment.getAppointmentCode() + " for request " + req.getRequestCode(),
                    NotificationType.APPOINTMENT_CONFIRMED,
                    req.getServiceRequestId(),
                    req.getRequestCode()
            );
        } catch (Exception ignored) {
        }

        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDetailResponse> getActiveAppointmentsForCustomer(UUID customerId) {
        return appointmentRepository
                .findByCustomer_UserIdAndStatusInOrderByAppointmentDateAsc(customerId, List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.ARRIVED))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentDetailResponse getAppointmentDetail(UUID appointmentId, UUID customerId) {
        Appointment appointment = appointmentRepository.findByAppointmentIdAndCustomer_UserId(appointmentId, customerId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));
        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDetailResponse> getAppointmentsByDate(java.time.LocalDate date) {
        return appointmentRepository.findConfirmedAppointmentsByDate(date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Map<java.time.LocalDate, Long> getAppointmentCountsByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        List<Object[]> rows = appointmentRepository.countAppointmentsByDateRange(startDate, endDate);
        java.util.Map<java.time.LocalDate, Long> map = new java.util.HashMap<>();
        for (Object[] row : rows) {
            if (row[0] instanceof java.time.LocalDate d && row[1] instanceof Number n) {
                map.put(d, n.longValue());
            } else if (row[0] instanceof java.sql.Date sd && row[1] instanceof Number n) {
                map.put(sd.toLocalDate(), n.longValue());
            }
        }
        return map;
    }

    @Transactional(readOnly = true)
    public AppointmentDetailResponse getAppointmentByIdForStaff(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentDetailResponse markAppointmentArrived(UUID appointmentId, String staffUsername) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() == AppointmentStatus.ARRIVED) {
            return toResponse(appointment);
        }
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments waiting for vehicle can be marked as arrived. Current status: " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.ARRIVED);
        appointment.setUpdatedAt(Instant.now());
        Appointment saved = appointmentRepository.save(appointment);

        // Notify customer that vehicle arrived
        try {
            UserAccount customer = saved.getCustomer();
            Vehicle vehicle = saved.getVehicle();
            String vehicleName = vehicle != null ? (vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel()) : "vehicle";
            notificationService.createAndSendCustomerNotification(
                    customer,
                    "Vehicle Checked In / Arrived",
                    "Your vehicle (" + vehicleName + ") has arrived at RepairLink workshop for appointment " + saved.getAppointmentCode() + ".",
                    NotificationType.APPOINTMENT_ARRIVED,
                    saved.getAppointmentId(),
                    saved.getAppointmentCode()
            );
        } catch (Exception ignored) {}

        // Broadcast to staff so their appointments page updates in real-time
        try {
            notificationService.createAndBroadcastStaffNotification(
                    "Vehicle Arrived",
                    "Vehicle arrived for appointment " + saved.getAppointmentCode(),
                    NotificationType.APPOINTMENT_ARRIVED,
                    saved.getServiceRequest() != null ? saved.getServiceRequest().getServiceRequestId() : saved.getAppointmentId(),
                    saved.getAppointmentCode()
            );
        } catch (Exception ignored) {}

        return toResponse(saved);
    }

    @Transactional
    public AppointmentDetailResponse markAppointmentNoShow(UUID appointmentId, String staffUsername) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            return toResponse(appointment);
        }
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments waiting for vehicle can be marked as no-show. Current status: " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setCancelledBy(staffUsername != null ? staffUsername : "STAFF_NO_SHOW");
        appointment.setCancellationReason("No-Show: Vehicle did not arrive for scheduled appointment.");
        appointment.setCancelledAt(Instant.now());
        appointment.setUpdatedAt(Instant.now());
        Appointment saved = appointmentRepository.save(appointment);

        // Cancel associated service request
        ServiceRequest req = saved.getServiceRequest();
        if (req != null) {
            req.setStatus(ServiceRequestStatus.CANCELLED);
            req.setCancellationReason("No-Show: Customer vehicle did not arrive for appointment " + saved.getAppointmentCode());
            req.setCancelledBy(staffUsername != null ? staffUsername : "STAFF_NO_SHOW");
            req.setUpdatedAt(Instant.now());
            serviceRequestRepository.save(req);
        }

        // Notify customer
        try {
            UserAccount customer = saved.getCustomer();
            Vehicle vehicle = saved.getVehicle();
            String vehicleName = vehicle != null ? (vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel()) : "vehicle";
            notificationService.createAndSendCustomerNotification(
                    customer,
                    "Appointment Marked as No-Show",
                    "Your appointment " + saved.getAppointmentCode() + " for " + vehicleName + " was marked as No-Show because the vehicle did not arrive. The appointment has been cancelled.",
                    NotificationType.APPOINTMENT_CANCELLED,
                    saved.getAppointmentId(),
                    saved.getAppointmentCode()
            );
        } catch (Exception ignored) {}

        // Broadcast to staff so their appointments page updates in real-time
        try {
            notificationService.createAndBroadcastStaffNotification(
                    "Appointment Marked No-Show",
                    "Appointment " + saved.getAppointmentCode() + " was marked as No-Show",
                    NotificationType.APPOINTMENT_CANCELLED,
                    req != null ? req.getServiceRequestId() : saved.getAppointmentId(),
                    saved.getAppointmentCode()
            );
        } catch (Exception ignored) {}

        return toResponse(saved);
    }

    @Transactional
    public AppointmentDetailResponse cancelAppointmentByCustomer(UUID appointmentId, UUID customerId, String reason) {
        Appointment appointment = appointmentRepository.findByAppointmentIdAndCustomer_UserId(appointmentId, customerId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() == AppointmentStatus.ARRIVED) {
            throw new IllegalStateException("The vehicle has already arrived at the service center. Appointment cannot be cancelled.");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalArgumentException("This appointment is not active and cannot be cancelled.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setCancelledBy("CUSTOMER");
        appointment.setCancelledAt(Instant.now());
        appointment.setUpdatedAt(Instant.now());
        Appointment saved = appointmentRepository.save(appointment);

        // Cancel associated service request
        ServiceRequest req = saved.getServiceRequest();
        if (req != null) {
            req.setStatus(ServiceRequestStatus.CANCELLED);
            req.setCancellationReason(reason);
            req.setCancelledBy("CUSTOMER");
            req.setUpdatedAt(Instant.now());
            serviceRequestRepository.save(req);
        }

        // Deduct up to 20 points from customer loyalty account
        try {
            loyaltyService.deductPointsForAppointmentCancellation(
                    customerId,
                    20,
                    saved.getAppointmentCode(),
                    saved.getAppointmentId()
            );
        } catch (Exception ignored) {
        }

        // Send cancellation notification to all staff members
        try {
            UserAccount customer = saved.getCustomer();
            Vehicle vehicle = saved.getVehicle();
            String customerName = customer != null ? customer.getFullName() : "Customer";
            String vehicleName = vehicle != null
                    ? (vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel())
                    : "vehicle";

            String staffNotiTitle = "Appointment Cancelled by Customer";
            String staffNotiMessage = "Customer " + customerName + " cancelled appointment " + saved.getAppointmentCode() +
                    " (" + vehicleName + "). Reason: " + reason + " (20 loyalty points fee applied).";

            notificationService.createAndBroadcastStaffNotification(
                    staffNotiTitle,
                    staffNotiMessage,
                    NotificationType.APPOINTMENT_CANCELLED,
                    req != null ? req.getServiceRequestId() : saved.getAppointmentId(),
                    saved.getAppointmentCode()
            );
        } catch (Exception ignored) {
        }

        return toResponse(saved);
    }

    private String extractStartTime(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) return "";
        try {
            return timeSlot.split("–|-")[0].trim();
        } catch (Exception e) {
            return "";
        }
    }

    private Integer calculateDurationMinutes(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) return 60;
        try {
            String[] parts = timeSlot.split("–|-");
            if (parts.length >= 2) {
                java.time.LocalTime start = java.time.LocalTime.parse(parts[0].trim(), java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
                java.time.LocalTime end = java.time.LocalTime.parse(parts[1].trim(), java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
                long mins = java.time.Duration.between(start, end).toMinutes();
                if (mins > 0) return (int) mins;
            }
        } catch (Exception ignored) {}
        return 60;
    }

    private AppointmentDetailResponse toResponse(Appointment apt) {
        ServiceRequest req = apt.getServiceRequest();
        Vehicle v = apt.getVehicle();
        UserAccount c = apt.getCustomer();

        AppointmentDetailResponse.VehicleSummaryDto vehicleDto = v != null
                ? new AppointmentDetailResponse.VehicleSummaryDto(
                        v.getVehicleId(),
                        v.getNickname(),
                        v.getMake(),
                        v.getModel(),
                        v.getYear(),
                        v.getLicensePlate(),
                        v.getColor(),
                        v.getVehicleType() != null ? v.getVehicleType().name() : "NORMAL_CAR",
                        v.getCurrentMileage(),
                        v.getMileageUnit() != null ? v.getMileageUnit().name() : "MI"
                )
                : null;

        AppointmentDetailResponse.CustomerSummaryDto customerDto = c != null
                ? new AppointmentDetailResponse.CustomerSummaryDto(
                        c.getUserId(),
                        c.getFullName(),
                        c.getEmail(),
                        c.getPhone()
                )
                : null;

        List<AppointmentDetailResponse.ServiceItemDto> serviceDtos = req != null && req.getAdditionalServices() != null
                ? req.getAdditionalServices().stream()
                        .map(s -> new AppointmentDetailResponse.ServiceItemDto(
                                s.getAdditionalServiceId(),
                                s.getName(),
                                s.getPrice()
                        ))
                        .sorted(Comparator.comparing(AppointmentDetailResponse.ServiceItemDto::name))
                        .toList()
                : List.of();

        List<AppointmentDetailResponse.PhotoItemDto> photoDtos = req != null && req.getPhotos() != null
                ? req.getPhotos().stream()
                        .map((ServiceRequestPhoto p) -> new AppointmentDetailResponse.PhotoItemDto(
                                p.getPhotoId(),
                                p.getOriginalFileName(),
                                p.getStoredFileName(),
                                "/uploads/" + p.getStoredFileName(),
                                p.getFileSize(),
                                p.getContentType()
                        ))
                        .toList()
                : List.of();

        return new AppointmentDetailResponse(
                apt.getAppointmentId(),
                apt.getAppointmentCode(),
                req != null ? req.getServiceRequestId() : null,
                req != null ? req.getRequestCode() : null,
                apt.getStatus().name(),
                apt.getAppointmentDate(),
                apt.getTimeSlot(),
                extractStartTime(apt.getTimeSlot()),
                calculateDurationMinutes(apt.getTimeSlot()),
                apt.getHandoverMethod() != null ? apt.getHandoverMethod().name() : "DROPOFF",
                apt.getPickupLocation(),
                req != null ? req.getProblemDescription() : "",
                vehicleDto,
                customerDto,
                serviceDtos,
                photoDtos,
                apt.getCancellationReason(),
                apt.getCancelledBy(),
                apt.getCancelledAt(),
                apt.getConfirmedBy(),
                apt.getCreatedAt(),
                apt.getUpdatedAt()
        );
    }
}

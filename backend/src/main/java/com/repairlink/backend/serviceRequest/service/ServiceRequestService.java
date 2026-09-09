package com.repairlink.backend.serviceRequest.service;

import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.repository.AdditionalServiceRepository;
import com.repairlink.backend.schedule.entity.SlotHold;
import com.repairlink.backend.schedule.entity.SlotHoldStatus;
import com.repairlink.backend.schedule.repository.SlotHoldRepository;
import com.repairlink.backend.schedule.service.ScheduleService;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.notification.entity.NotificationType;
import com.repairlink.backend.notification.service.NotificationService;
import com.repairlink.backend.serviceRequest.dto.CustomerServiceRequestDetailResponse;
import com.repairlink.backend.serviceRequest.dto.ServiceRequestResponse;
import com.repairlink.backend.serviceRequest.dto.StaffServiceRequestDetailResponse;
import com.repairlink.backend.serviceRequest.dto.StaffServiceRequestSummaryResponse;
import com.repairlink.backend.serviceRequest.entity.*;
import com.repairlink.backend.serviceRequest.repository.ServiceRequestRepository;
import com.repairlink.backend.vehicle.entity.Vehicle;
import com.repairlink.backend.vehicle.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final UserAccountRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final AdditionalServiceRepository additionalServiceRepository;
    private final FileStorageService fileStorageService;
    private final SlotHoldRepository slotHoldRepository;
    private final ScheduleService scheduleService;
    private final NotificationService notificationService;

    public ServiceRequestService(
            ServiceRequestRepository requestRepository,
            UserAccountRepository userRepository,
            VehicleRepository vehicleRepository,
            AdditionalServiceRepository additionalServiceRepository,
            FileStorageService fileStorageService,
            SlotHoldRepository slotHoldRepository,
            ScheduleService scheduleService,
            NotificationService notificationService
    ) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.additionalServiceRepository = additionalServiceRepository;
        this.fileStorageService = fileStorageService;
        this.slotHoldRepository = slotHoldRepository;
        this.scheduleService = scheduleService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ServiceRequestResponse createServiceRequest(
            UUID customerId,
            UUID vehicleId,
            String problem,
            LocalDate preferredDate,
            String timeSlot,
            HandoverMethod handoverMethod,
            String pickupLocation,
            List<UUID> additionalServiceIds,
            List<MultipartFile> photos
    ) {
        // Validate customer
        UserAccount customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found."));

        // Validate vehicle ownership
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found."));
        if (!vehicle.getOwner().getUserId().equals(customerId)) {
            throw new IllegalArgumentException("Vehicle does not belong to this customer.");
        }

        // Validate vehicle does not already have an active request
        boolean hasActiveRequest = requestRepository.existsByVehicleVehicleIdAndStatusNotIn(
                vehicleId,
                List.of(ServiceRequestStatus.CANCELLED, ServiceRequestStatus.REJECTED)
        );
        if (hasActiveRequest) {
            throw new IllegalArgumentException(
                    "This vehicle already has an active service request. You cannot submit another request for this vehicle unless the existing request is cancelled or rejected."
            );
        }

        // Validate problem
        if (problem == null || problem.trim().length() < 10) {
            throw new IllegalArgumentException("Problem description must be at least 10 characters.");
        }

        // Validate handover
        if (handoverMethod == HandoverMethod.PICKUP &&
                (pickupLocation == null || pickupLocation.trim().isEmpty())) {
            throw new IllegalArgumentException("Pickup location is required for pickup handover.");
        }

        // Validate photos
        if (photos != null && photos.size() > 5) {
            throw new IllegalArgumentException("Maximum 5 photos allowed.");
        }

        // Validate additional services
        Set<AdditionalService> selectedServices = new HashSet<>();
        if (additionalServiceIds != null && !additionalServiceIds.isEmpty()) {
            for (UUID serviceId : additionalServiceIds) {
                AdditionalService svc = additionalServiceRepository.findById(serviceId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Additional service not found: " + serviceId));
                if (svc.getStatus() != AdditionalServiceStatus.ACTIVE) {
                    throw new IllegalArgumentException(
                            "Additional service is not active: " + svc.getName());
                }
                selectedServices.add(svc);
            }
        }

        // Validate preferred date and slot
        scheduleService.validateBookingDate(preferredDate);
        LocalDate today = LocalDate.now();
        if (preferredDate.equals(today)) {
            LocalTime slotStart = parseSlotStartTime(timeSlot);
            if (slotStart != null && !slotStart.isAfter(LocalTime.now())) {
                throw new IllegalArgumentException("Preferred time slot cannot be in the past.");
            }
        }

        Instant now = Instant.now();
        Optional<SlotHold> activeHold = slotHoldRepository.findActiveCustomerHold(customerId, preferredDate, timeSlot, now);
        if (activeHold.isEmpty()) {
            activeHold = slotHoldRepository.findActiveHoldByCustomer(customerId, now)
                    .filter(h -> h.getServiceDate().equals(preferredDate));
        }

        if (activeHold.isEmpty()) {
            scheduleService.validateSlotCapacity(preferredDate, timeSlot, customerId);
        }

        // Build entity
        ServiceRequest request = new ServiceRequest();
        String requestCode = requestRepository.getNextRequestCode();
        request.setRequestCode(requestCode);
        request.setCustomer(customer);
        request.setVehicle(vehicle);
        request.setProblemDescription(problem.trim());
        request.setPreferredDate(preferredDate);
        request.setPreferredTimeSlot(timeSlot);
        request.setHandoverMethod(handoverMethod);
        request.setPickupLocation(
                handoverMethod == HandoverMethod.PICKUP ? pickupLocation.trim() : null);
        request.setStatus(ServiceRequestStatus.PENDING_REVIEW);
        request.setAdditionalServices(selectedServices);

        // Store photos
        if (photos != null) {
            for (MultipartFile photoFile : photos) {
                if (photoFile.isEmpty()) continue;
                String storedName = fileStorageService.store(photoFile);

                ServiceRequestPhoto photo = new ServiceRequestPhoto();
                photo.setOriginalFileName(photoFile.getOriginalFilename());
                photo.setStoredFileName(storedName);
                photo.setFileSize(photoFile.getSize());
                photo.setContentType(photoFile.getContentType());
                request.addPhoto(photo);
            }
        }

        ServiceRequest saved = requestRepository.save(request);

        if (activeHold.isPresent()) {
            SlotHold hold = activeHold.get();
            hold.setStatus(SlotHoldStatus.CONVERTED);
            hold.setServiceRequest(saved);
            slotHoldRepository.save(hold);
        }
        slotHoldRepository.releaseActiveHoldsByCustomerId(customerId, now);

        String vehicleName = vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel();

        // Broadcast notification to staff
        try {
            notificationService.createAndBroadcastStaffNotification(
                    "New Service Request",
                    "Customer " + customer.getFullName() + " submitted request " + saved.getRequestCode() + " for " + vehicleName,
                    NotificationType.SERVICE_REQUEST_SUBMITTED,
                    saved.getServiceRequestId(),
                    saved.getRequestCode()
            );
        } catch (Exception ignored) {
        }

        // Build response
        List<String> serviceNames = selectedServices.stream()
                .map(AdditionalService::getName)
                .sorted()
                .toList();

        return new ServiceRequestResponse(
                saved.getServiceRequestId(),
                saved.getRequestCode(),
                saved.getStatus().name(),
                vehicleName,
                saved.getProblemDescription().length() > 100
                        ? saved.getProblemDescription().substring(0, 100) + "..."
                        : saved.getProblemDescription(),
                saved.getPreferredDate(),
                saved.getPreferredTimeSlot(),
                saved.getHandoverMethod().name(),
                saved.getPhotos().size(),
                serviceNames,
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<CustomerServiceRequestDetailResponse> getCustomerServiceRequests(UUID customerId) {
        List<ServiceRequest> requests = requestRepository.findByCustomerUserIdOrderByCreatedAtDesc(customerId);

        return requests.stream().map(req -> {
            Vehicle v = req.getVehicle();
            CustomerServiceRequestDetailResponse.VehicleSummaryDto vehicleDto =
                    new CustomerServiceRequestDetailResponse.VehicleSummaryDto(
                            v.getVehicleId(),
                            v.getNickname(),
                            v.getMake(),
                            v.getModel(),
                            v.getYear(),
                            v.getLicensePlate(),
                            v.getVehicleType() != null ? v.getVehicleType().name() : null
                    );

            List<CustomerServiceRequestDetailResponse.ServiceItemDto> serviceDtos =
                    req.getAdditionalServices().stream()
                            .map(s -> new CustomerServiceRequestDetailResponse.ServiceItemDto(
                                    s.getAdditionalServiceId(),
                                    s.getName(),
                                    s.getPrice()
                            ))
                            .sorted(Comparator.comparing(CustomerServiceRequestDetailResponse.ServiceItemDto::name))
                            .toList();

            List<CustomerServiceRequestDetailResponse.PhotoItemDto> photoDtos =
                    req.getPhotos().stream()
                            .map(p -> new CustomerServiceRequestDetailResponse.PhotoItemDto(
                                    p.getPhotoId(),
                                    p.getOriginalFileName(),
                                    p.getStoredFileName(),
                                    "/uploads/" + p.getStoredFileName(),
                                    p.getFileSize(),
                                    p.getContentType()
                            ))
                            .toList();

            return new CustomerServiceRequestDetailResponse(
                    req.getServiceRequestId(),
                    req.getRequestCode(),
                    req.getStatus().name(),
                    vehicleDto,
                    req.getProblemDescription(),
                    req.getPreferredDate(),
                    req.getPreferredTimeSlot(),
                    req.getHandoverMethod().name(),
                    req.getPickupLocation(),
                    serviceDtos,
                    photoDtos,
                    req.getCreatedAt(),
                    req.getUpdatedAt()
            );
        }).toList();
    }

    @Transactional
    public void deleteServiceRequest(UUID customerId, UUID serviceRequestId) {
        ServiceRequest request = requestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Service request not found: " + serviceRequestId));

        if (!request.getCustomer().getUserId().equals(customerId)) {
            throw new IllegalArgumentException("You are not authorized to delete this service request.");
        }

        // Delete photo files from disk
        if (request.getPhotos() != null) {
            for (ServiceRequestPhoto photo : request.getPhotos()) {
                fileStorageService.delete(photo.getStoredFileName());
            }
        }

        requestRepository.delete(request);
    }

    @Transactional
    public void cancelServiceRequest(UUID customerId, UUID serviceRequestId) {
        ServiceRequest request = requestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Service request not found: " + serviceRequestId));

        if (!request.getCustomer().getUserId().equals(customerId)) {
            throw new IllegalArgumentException("You are not authorized to cancel this service request.");
        }

        if (request.getStatus() == ServiceRequestStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed service requests cannot be cancelled.");
        }

        request.setStatus(ServiceRequestStatus.CANCELLED);
        ServiceRequest saved = requestRepository.save(request);

        // Notify staff in real time that the customer cancelled this request
        try {
            UserAccount customer = request.getCustomer();
            Vehicle vehicle = request.getVehicle();
            String customerName = customer != null ? customer.getFullName() : "Customer";
            String vehicleName = vehicle != null
                    ? (vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel())
                    : "vehicle";

            notificationService.createAndBroadcastStaffNotification(
                    "Service Request Cancelled",
                    "Customer " + customerName + " cancelled request " + saved.getRequestCode() + " for " + vehicleName,
                    NotificationType.SERVICE_REQUEST_CANCELLED,
                    saved.getServiceRequestId(),
                    saved.getRequestCode()
            );
        } catch (Exception ignored) {
        }
    }

    @Transactional(readOnly = true)
    public List<UUID> getActiveVehicleIdsForCustomer(UUID customerId) {
        return requestRepository.findByCustomerUserIdOrderByCreatedAtDesc(customerId).stream()
                .filter(r -> r.getStatus() != ServiceRequestStatus.CANCELLED && r.getStatus() != ServiceRequestStatus.REJECTED)
                .map(r -> r.getVehicle().getVehicleId())
                .distinct()
                .toList();
    }

    private LocalTime parseSlotStartTime(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) return null;
        try {
            String startStr = timeSlot.split("–|-")[0].trim();
            return LocalTime.parse(startStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<StaffServiceRequestSummaryResponse> getAllServiceRequestsForStaff() {
        List<ServiceRequest> requests = requestRepository.findAllByOrderByCreatedAtDesc();

        return requests.stream().map(req -> {
            Vehicle v = req.getVehicle();
            String vehicleName = v != null
                    ? (v.getYear() + " " + v.getMake() + " " + v.getModel())
                    : "N/A";
            String licensePlate = v != null ? v.getLicensePlate() : "N/A";

            UserAccount customer = req.getCustomer();
            String customerName = customer != null ? customer.getFullName() : "Unknown";
            String customerEmail = customer != null ? customer.getEmail() : "";
            String customerPhone = customer != null ? customer.getPhone() : "";

            List<String> additionalServiceNames = req.getAdditionalServices().stream()
                    .map(AdditionalService::getName)
                    .sorted()
                    .toList();

            String problemSummary = req.getProblemDescription().length() > 80
                    ? req.getProblemDescription().substring(0, 80) + "..."
                    : req.getProblemDescription();

            return new StaffServiceRequestSummaryResponse(
                    req.getServiceRequestId(),
                    req.getRequestCode(),
                    req.getStatus().name(),
                    customerName,
                    customerEmail,
                    customerPhone,
                    vehicleName,
                    licensePlate,
                    problemSummary,
                    req.getPreferredDate(),
                    req.getPreferredTimeSlot(),
                    req.getHandoverMethod().name(),
                    req.getPhotos().size(),
                    additionalServiceNames,
                    req.getCreatedAt()
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public StaffServiceRequestDetailResponse getServiceRequestDetailForStaff(UUID serviceRequestId) {
        ServiceRequest req = requestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Service request not found: " + serviceRequestId));

        UserAccount customer = req.getCustomer();
        StaffServiceRequestDetailResponse.CustomerProfileDto customerDto =
                new StaffServiceRequestDetailResponse.CustomerProfileDto(
                        customer.getUserId(),
                        customer.getFullName(),
                        customer.getEmail(),
                        customer.getPhone(),
                        formatMemberSince(customer.getCreatedAt())
                );

        Vehicle v = req.getVehicle();
        StaffServiceRequestDetailResponse.VehicleDetailDto vehicleDto =
                new StaffServiceRequestDetailResponse.VehicleDetailDto(
                        v.getVehicleId(),
                        v.getNickname(),
                        v.getMake(),
                        v.getModel(),
                        v.getYear(),
                        v.getLicensePlate(),
                        v.getVehicleType() != null ? v.getVehicleType().name() : "NORMAL_CAR",
                        v.getFuelType() != null ? v.getFuelType().name() : null,
                        v.getTransmission() != null ? v.getTransmission().name() : null,
                        v.getColor(),
                        v.getCurrentMileage(),
                        v.getMileageUnit() != null ? v.getMileageUnit().name() : "MI"
                );

        List<StaffServiceRequestDetailResponse.ServiceItemDto> serviceDtos =
                req.getAdditionalServices().stream()
                        .map(s -> new StaffServiceRequestDetailResponse.ServiceItemDto(
                                s.getAdditionalServiceId(),
                                s.getName(),
                                s.getPrice()
                        ))
                        .sorted(Comparator.comparing(StaffServiceRequestDetailResponse.ServiceItemDto::name))
                        .toList();

        List<StaffServiceRequestDetailResponse.PhotoItemDto> photoDtos =
                req.getPhotos().stream()
                        .map(p -> new StaffServiceRequestDetailResponse.PhotoItemDto(
                                p.getPhotoId(),
                                p.getOriginalFileName(),
                                p.getStoredFileName(),
                                "/uploads/" + p.getStoredFileName(),
                                p.getFileSize(),
                                p.getContentType()
                        ))
                        .toList();

        boolean isScheduled = req.getStatus() == ServiceRequestStatus.APPOINTMENT_SCHEDULED
                || req.getStatus() == ServiceRequestStatus.COMPLETED;
        boolean isCompleted = req.getStatus() == ServiceRequestStatus.COMPLETED;

        StaffServiceRequestDetailResponse.ServiceLifecycleDto lifecycle =
                new StaffServiceRequestDetailResponse.ServiceLifecycleDto(
                        new StaffServiceRequestDetailResponse.LifecycleStepDto(
                                "Service Request Created",
                                true,
                                false,
                                req.getCreatedAt()
                        ),
                        new StaffServiceRequestDetailResponse.LifecycleStepDto(
                                "Appointment Scheduled",
                                isScheduled,
                                !isScheduled,
                                isScheduled ? req.getUpdatedAt() : null
                        ),
                        new StaffServiceRequestDetailResponse.LifecycleStepDto(
                                "Completed",
                                isCompleted,
                                !isCompleted,
                                isCompleted ? req.getUpdatedAt() : null
                        )
                );

        return new StaffServiceRequestDetailResponse(
                req.getServiceRequestId(),
                req.getRequestCode(),
                req.getStatus().name(),
                customerDto,
                vehicleDto,
                req.getProblemDescription(),
                req.getPreferredDate(),
                req.getPreferredTimeSlot(),
                req.getHandoverMethod().name(),
                req.getPickupLocation(),
                serviceDtos,
                photoDtos,
                lifecycle,
                req.getCreatedAt(),
                req.getUpdatedAt()
        );
    }

    private String formatMemberSince(Instant createdAt) {
        if (createdAt == null) {
            return "";
        }
        return createdAt
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate()
                .toString();
    }
}

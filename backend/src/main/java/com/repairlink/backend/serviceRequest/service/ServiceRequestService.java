package com.repairlink.backend.serviceRequest.service;

import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.repository.AdditionalServiceRepository;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.serviceRequest.dto.CustomerServiceRequestDetailResponse;
import com.repairlink.backend.serviceRequest.dto.ServiceRequestResponse;
import com.repairlink.backend.serviceRequest.entity.*;
import com.repairlink.backend.serviceRequest.repository.ServiceRequestRepository;
import com.repairlink.backend.vehicle.entity.Vehicle;
import com.repairlink.backend.vehicle.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final UserAccountRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final AdditionalServiceRepository additionalServiceRepository;
    private final FileStorageService fileStorageService;

    public ServiceRequestService(
            ServiceRequestRepository requestRepository,
            UserAccountRepository userRepository,
            VehicleRepository vehicleRepository,
            AdditionalServiceRepository additionalServiceRepository,
            FileStorageService fileStorageService
    ) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.additionalServiceRepository = additionalServiceRepository;
        this.fileStorageService = fileStorageService;
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

        // Build entity
        ServiceRequest request = new ServiceRequest();
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

        // Build response
        String vehicleName = vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel();
        List<String> serviceNames = selectedServices.stream()
                .map(AdditionalService::getName)
                .sorted()
                .toList();

        return new ServiceRequestResponse(
                saved.getServiceRequestId(),
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
}

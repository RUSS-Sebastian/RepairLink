package com.repairlink.backend.serviceRequest.entity;

import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.vehicle.entity.Vehicle;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    @Id
    @UuidGenerator
    @Column(name = "service_request_id", nullable = false, updatable = false)
    private UUID serviceRequestId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserAccount customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "problem_description", nullable = false, columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "preferred_date", nullable = false)
    private LocalDate preferredDate;

    @Column(name = "preferred_time_slot", nullable = false, length = 30)
    private String preferredTimeSlot;

    @Enumerated(EnumType.STRING)
    @Column(name = "handover_method", nullable = false, length = 20)
    private HandoverMethod handoverMethod;

    @Column(name = "pickup_location", length = 500)
    private String pickupLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ServiceRequestStatus status;

    @OneToMany(mappedBy = "serviceRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceRequestPhoto> photos = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "service_request_additional_services",
            joinColumns = @JoinColumn(name = "service_request_id"),
            inverseJoinColumns = @JoinColumn(name = "additional_service_id")
    )
    private Set<AdditionalService> additionalServices = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void beforeInsert() {
        if (this.status == null) this.status = ServiceRequestStatus.PENDING_REVIEW;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    void beforeUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addPhoto(ServiceRequestPhoto photo) {
        photos.add(photo);
        photo.setServiceRequest(this);
    }

    // Getters and setters
    public UUID getServiceRequestId() { return serviceRequestId; }
    public void setServiceRequestId(UUID serviceRequestId) { this.serviceRequestId = serviceRequestId; }

    public UserAccount getCustomer() { return customer; }
    public void setCustomer(UserAccount customer) { this.customer = customer; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public String getProblemDescription() { return problemDescription; }
    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }

    public String getPreferredTimeSlot() { return preferredTimeSlot; }
    public void setPreferredTimeSlot(String preferredTimeSlot) { this.preferredTimeSlot = preferredTimeSlot; }

    public HandoverMethod getHandoverMethod() { return handoverMethod; }
    public void setHandoverMethod(HandoverMethod handoverMethod) { this.handoverMethod = handoverMethod; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public ServiceRequestStatus getStatus() { return status; }
    public void setStatus(ServiceRequestStatus status) { this.status = status; }

    public List<ServiceRequestPhoto> getPhotos() { return photos; }
    public void setPhotos(List<ServiceRequestPhoto> photos) { this.photos = photos; }

    public Set<AdditionalService> getAdditionalServices() { return additionalServices; }
    public void setAdditionalServices(Set<AdditionalService> additionalServices) { this.additionalServices = additionalServices; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

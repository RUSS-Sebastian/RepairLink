package com.repairlink.backend.schedule.entity;

import com.repairlink.backend.security.auth.entity.UserAccount;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "slot_holds")
public class SlotHold {

    @Id
    @UuidGenerator
    @Column(name = "hold_id", nullable = false, updatable = false)
    private UUID holdId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserAccount customer;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "time_slot", nullable = false, length = 30)
    private String timeSlot;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SlotHoldStatus status = SlotHoldStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id")
    private com.repairlink.backend.serviceRequest.entity.ServiceRequest serviceRequest;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void beforeInsert() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
        if (this.status == null) {
            this.status = SlotHoldStatus.ACTIVE;
        }
    }

    @PreUpdate
    void beforeUpdate() {
        this.updatedAt = Instant.now();
    }

    public SlotHold() {}

    public SlotHold(UserAccount customer, LocalDate serviceDate, String timeSlot, Instant expiresAt) {
        this.customer = customer;
        this.serviceDate = serviceDate;
        this.timeSlot = timeSlot;
        this.expiresAt = expiresAt;
        this.status = SlotHoldStatus.ACTIVE;
    }

    public UUID getHoldId() { return holdId; }
    public void setHoldId(UUID holdId) { this.holdId = holdId; }

    public UserAccount getCustomer() { return customer; }
    public void setCustomer(UserAccount customer) { this.customer = customer; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public SlotHoldStatus getStatus() { return status; }
    public void setStatus(SlotHoldStatus status) { this.status = status; }

    public com.repairlink.backend.serviceRequest.entity.ServiceRequest getServiceRequest() { return serviceRequest; }
    public void setServiceRequest(com.repairlink.backend.serviceRequest.entity.ServiceRequest serviceRequest) { this.serviceRequest = serviceRequest; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}


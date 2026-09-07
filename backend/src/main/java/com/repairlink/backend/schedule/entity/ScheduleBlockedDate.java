package com.repairlink.backend.schedule.entity;

import com.repairlink.backend.security.auth.entity.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "schedule_blocked_dates")
public class ScheduleBlockedDate {

    @Id
    @UuidGenerator
    @Column(name = "blocked_date_id", nullable = false, updatable = false)
    private UUID blockedDateId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "configuration_id", nullable = false)
    private ScheduleConfiguration configuration;

    @Column(name = "blocked_date", nullable = false)
    private LocalDate blockedDate;

    @Column(name = "reason", nullable = false, length = 255)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ScheduleBlockedDate() {
    }

    public ScheduleBlockedDate(ScheduleConfiguration configuration, LocalDate blockedDate, String reason, UserAccount createdBy) {
        this.configuration = configuration;
        this.blockedDate = blockedDate;
        this.reason = reason;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void beforeInsert() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getBlockedDateId() {
        return blockedDateId;
    }

    public void setBlockedDateId(UUID blockedDateId) {
        this.blockedDateId = blockedDateId;
    }

    public ScheduleConfiguration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(ScheduleConfiguration configuration) {
        this.configuration = configuration;
    }

    public LocalDate getBlockedDate() {
        return blockedDate;
    }

    public void setBlockedDate(LocalDate blockedDate) {
        this.blockedDate = blockedDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public UserAccount getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserAccount createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}


package com.repairlink.backend.schedule.entity;

import com.repairlink.backend.security.auth.entity.UserAccount;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "schedule_configurations")
public class ScheduleConfiguration {

    @Id
    @UuidGenerator
    @Column(name = "configuration_id", nullable = false, updatable = false)
    private UUID configurationId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "booking_window_days", nullable = false)
    private Integer bookingWindowDays;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes;

    @Column(name = "slot_capacity", nullable = false)
    private Integer slotCapacity;

    @Column(name = "hold_duration_minutes", nullable = false)
    private Integer holdDurationMinutes;

    @Column(name = "cancellation_notice_hours", nullable = false)
    private Integer cancellationNoticeHours;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "operating_days", nullable = false, columnDefinition = "varchar(15)[]")
    private List<String> operatingDays = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ScheduleStatus status = ScheduleStatus.UPCOMING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "configuration", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startTime ASC")
    private List<ScheduleBreak> breaks = new ArrayList<>();

    @OneToMany(mappedBy = "configuration", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("blockedDate ASC")
    private List<ScheduleBlockedDate> blockedDates = new ArrayList<>();

    public ScheduleConfiguration() {
    }

    @PrePersist
    public void beforeInsert() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null) {
            status = ScheduleStatus.UPCOMING;
        }
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getConfigurationId() {
        return configurationId;
    }

    public void setConfigurationId(UUID configurationId) {
        this.configurationId = configurationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getBookingWindowDays() {
        return bookingWindowDays;
    }

    public void setBookingWindowDays(Integer bookingWindowDays) {
        this.bookingWindowDays = bookingWindowDays;
    }

    public LocalTime getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(LocalTime openingTime) {
        this.openingTime = openingTime;
    }

    public LocalTime getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(LocalTime closingTime) {
        this.closingTime = closingTime;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public Integer getSlotCapacity() {
        return slotCapacity;
    }

    public void setSlotCapacity(Integer slotCapacity) {
        this.slotCapacity = slotCapacity;
    }

    public Integer getHoldDurationMinutes() {
        return holdDurationMinutes;
    }

    public void setHoldDurationMinutes(Integer holdDurationMinutes) {
        this.holdDurationMinutes = holdDurationMinutes;
    }

    public Integer getCancellationNoticeHours() {
        return cancellationNoticeHours;
    }

    public void setCancellationNoticeHours(Integer cancellationNoticeHours) {
        this.cancellationNoticeHours = cancellationNoticeHours;
    }

    public List<String> getOperatingDays() {
        return operatingDays;
    }

    public void setOperatingDays(List<String> operatingDays) {
        this.operatingDays = operatingDays;
    }

    public ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(ScheduleStatus status) {
        this.status = status;
    }

    public UserAccount getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserAccount createdBy) {
        this.createdBy = createdBy;
    }

    public UserAccount getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(UserAccount updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ScheduleBreak> getBreaks() {
        return breaks;
    }

    public void setBreaks(List<ScheduleBreak> breaks) {
        this.breaks = breaks;
    }

    public List<ScheduleBlockedDate> getBlockedDates() {
        return blockedDates;
    }

    public void setBlockedDates(List<ScheduleBlockedDate> blockedDates) {
        this.blockedDates = blockedDates;
    }

    public void addBreak(ScheduleBreak scheduleBreak) {
        breaks.add(scheduleBreak);
        scheduleBreak.setConfiguration(this);
    }

    public void addBlockedDate(ScheduleBlockedDate blockedDate) {
        blockedDates.add(blockedDate);
        blockedDate.setConfiguration(this);
    }
}


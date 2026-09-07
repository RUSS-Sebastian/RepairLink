package com.repairlink.backend.schedule.entity;

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
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "schedule_breaks")
public class ScheduleBreak {

    @Id
    @UuidGenerator
    @Column(name = "break_id", nullable = false, updatable = false)
    private UUID breakId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "configuration_id", nullable = false)
    private ScheduleConfiguration configuration;

    @Column(name = "day_of_week", nullable = false, length = 15)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "label", nullable = false, length = 100)
    private String label = "Break";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ScheduleBreak() {
    }

    public ScheduleBreak(ScheduleConfiguration configuration, String dayOfWeek, LocalTime startTime, LocalTime endTime, String label) {
        this.configuration = configuration;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.label = (label != null && !label.isBlank()) ? label : "Break";
    }

    @PrePersist
    public void beforeInsert() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (label == null || label.isBlank()) {
            label = "Break";
        }
    }

    public UUID getBreakId() {
        return breakId;
    }

    public void setBreakId(UUID breakId) {
        this.breakId = breakId;
    }

    public ScheduleConfiguration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(ScheduleConfiguration configuration) {
        this.configuration = configuration;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}


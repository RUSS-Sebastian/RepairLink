package com.repairlink.backend.schedule.repository;

import com.repairlink.backend.schedule.entity.ScheduleBlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduleBlockedDateRepository extends JpaRepository<ScheduleBlockedDate, UUID> {
    Optional<ScheduleBlockedDate> findByConfigurationConfigurationIdAndBlockedDate(UUID configurationId, LocalDate blockedDate);
}


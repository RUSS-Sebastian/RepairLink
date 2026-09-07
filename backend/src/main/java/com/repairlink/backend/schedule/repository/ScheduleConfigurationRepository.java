package com.repairlink.backend.schedule.repository;

import com.repairlink.backend.schedule.entity.ScheduleConfiguration;
import com.repairlink.backend.schedule.entity.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduleConfigurationRepository extends JpaRepository<ScheduleConfiguration, UUID> {

    Optional<ScheduleConfiguration> findFirstByStatus(ScheduleStatus status);

    Optional<ScheduleConfiguration> findFirstByStatusOrderByStartDateAsc(ScheduleStatus status);

    @Query("""
        SELECT c FROM ScheduleConfiguration c
        WHERE (:dateFrom IS NULL OR c.endDate >= :dateFrom)
          AND (:dateTo IS NULL OR c.startDate <= :dateTo)
        ORDER BY c.startDate ASC
    """)
    Page<ScheduleConfiguration> findByDateRange(
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    @Query("""
        SELECT c FROM ScheduleConfiguration c
        WHERE :date >= c.startDate AND :date <= c.endDate
        ORDER BY c.startDate DESC
    """)
    List<ScheduleConfiguration> findConfigurationsForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(c) > 0 FROM ScheduleConfiguration c
        WHERE c.status IN (com.repairlink.backend.schedule.entity.ScheduleStatus.CURRENT, com.repairlink.backend.schedule.entity.ScheduleStatus.UPCOMING)
          AND (:excludeId IS NULL OR c.configurationId != :excludeId)
          AND (c.startDate <= :endDate AND c.endDate >= :startDate)
    """)
    boolean existsOverlappingWindow(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") UUID excludeId
    );

    @Query("""
        SELECT c FROM ScheduleConfiguration c
        WHERE c.status IN (com.repairlink.backend.schedule.entity.ScheduleStatus.CURRENT, com.repairlink.backend.schedule.entity.ScheduleStatus.UPCOMING)
          AND (:excludeId IS NULL OR c.configurationId != :excludeId)
          AND (c.startDate <= :endDate AND c.endDate >= :startDate)
        ORDER BY c.startDate ASC
    """)
    List<ScheduleConfiguration> findOverlappingConfigurations(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") UUID excludeId
    );
}


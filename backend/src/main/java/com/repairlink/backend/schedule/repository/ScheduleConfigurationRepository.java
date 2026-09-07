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

    Page<ScheduleConfiguration> findByEndDateGreaterThanEqualAndStartDateLessThanEqualOrderByStartDateAsc(
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    );

    Page<ScheduleConfiguration> findByEndDateGreaterThanEqualOrderByStartDateAsc(
            LocalDate dateFrom,
            Pageable pageable
    );

    Page<ScheduleConfiguration> findByStartDateLessThanEqualOrderByStartDateAsc(
            LocalDate dateTo,
            Pageable pageable
    );

    Page<ScheduleConfiguration> findAllByOrderByStartDateAsc(Pageable pageable);

    default Page<ScheduleConfiguration> findByDateRange(
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    ) {
        if (dateFrom != null && dateTo != null) {
            return findByEndDateGreaterThanEqualAndStartDateLessThanEqualOrderByStartDateAsc(dateFrom, dateTo, pageable);
        } else if (dateFrom != null) {
            return findByEndDateGreaterThanEqualOrderByStartDateAsc(dateFrom, pageable);
        } else if (dateTo != null) {
            return findByStartDateLessThanEqualOrderByStartDateAsc(dateTo, pageable);
        } else {
            return findAllByOrderByStartDateAsc(pageable);
        }
    }

    @Query("""
        SELECT c FROM ScheduleConfiguration c
        WHERE :date >= c.startDate AND :date <= c.endDate
        ORDER BY c.startDate DESC
    """)
    List<ScheduleConfiguration> findConfigurationsForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT c FROM ScheduleConfiguration c
        WHERE c.status IN (com.repairlink.backend.schedule.entity.ScheduleStatus.CURRENT, com.repairlink.backend.schedule.entity.ScheduleStatus.UPCOMING)
          AND c.startDate <= :endDate AND c.endDate >= :startDate
        ORDER BY c.startDate ASC
    """)
    List<ScheduleConfiguration> findOverlappingConfigurations(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT c FROM ScheduleConfiguration c
        WHERE c.status IN (com.repairlink.backend.schedule.entity.ScheduleStatus.CURRENT, com.repairlink.backend.schedule.entity.ScheduleStatus.UPCOMING)
          AND c.configurationId != :excludeId
          AND c.startDate <= :endDate AND c.endDate >= :startDate
        ORDER BY c.startDate ASC
    """)
    List<ScheduleConfiguration> findOverlappingConfigurationsExcluding(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") UUID excludeId
    );

    default List<ScheduleConfiguration> findOverlappingConfigurations(
            LocalDate startDate,
            LocalDate endDate,
            UUID excludeId
    ) {
        if (excludeId != null) {
            return findOverlappingConfigurationsExcluding(startDate, endDate, excludeId);
        }
        return findOverlappingConfigurations(startDate, endDate);
    }
}


package com.repairlink.backend.schedule.repository;

import com.repairlink.backend.schedule.entity.ScheduleBreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleBreakRepository extends JpaRepository<ScheduleBreak, UUID> {
    List<ScheduleBreak> findByConfigurationConfigurationId(UUID configurationId);
}


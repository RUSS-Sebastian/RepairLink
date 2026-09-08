package com.repairlink.backend.schedule.repository;

import com.repairlink.backend.schedule.entity.SlotHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SlotHoldRepository extends JpaRepository<SlotHold, UUID> {

    @Query("SELECT h FROM SlotHold h WHERE h.serviceDate = :date AND h.timeSlot = :timeSlot AND h.status = com.repairlink.backend.schedule.entity.SlotHoldStatus.ACTIVE AND h.expiresAt > :now")
    List<SlotHold> findActiveHoldsByDateAndTimeSlot(
            @Param("date") LocalDate date,
            @Param("timeSlot") String timeSlot,
            @Param("now") Instant now
    );

    @Query("SELECT h FROM SlotHold h JOIN FETCH h.customer WHERE h.serviceDate = :date AND h.status = com.repairlink.backend.schedule.entity.SlotHoldStatus.ACTIVE AND h.expiresAt > :now")
    List<SlotHold> findActiveHoldsByDate(
            @Param("date") LocalDate date,
            @Param("now") Instant now
    );

    @Query("SELECT h FROM SlotHold h WHERE h.customer.userId = :customerId AND h.serviceDate = :date AND h.timeSlot = :timeSlot AND h.status = com.repairlink.backend.schedule.entity.SlotHoldStatus.ACTIVE AND h.expiresAt > :now")
    Optional<SlotHold> findActiveCustomerHold(
            @Param("customerId") UUID customerId,
            @Param("date") LocalDate date,
            @Param("timeSlot") String timeSlot,
            @Param("now") Instant now
    );

    @Query("SELECT h FROM SlotHold h WHERE h.customer.userId = :customerId AND h.status = com.repairlink.backend.schedule.entity.SlotHoldStatus.ACTIVE AND h.expiresAt > :now")
    Optional<SlotHold> findActiveHoldByCustomer(
            @Param("customerId") UUID customerId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("UPDATE SlotHold h SET h.status = com.repairlink.backend.schedule.entity.SlotHoldStatus.RELEASED, h.updatedAt = :now WHERE h.customer.userId = :customerId AND h.status = com.repairlink.backend.schedule.entity.SlotHoldStatus.ACTIVE")
    void releaseActiveHoldsByCustomerId(@Param("customerId") UUID customerId, @Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM SlotHold h WHERE h.customer.userId = :customerId")
    void deleteByCustomerId(@Param("customerId") UUID customerId);
}


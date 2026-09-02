package com.repairlink.backend.vehicle.repository;

import com.repairlink.backend.vehicle.entity.VehiclePlateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface VehiclePlateHistoryRepository
        extends JpaRepository<VehiclePlateHistory, UUID> {

    List<VehiclePlateHistory> findAllByVehicleVehicleIdOrderByChangedAtDesc(
            UUID vehicleId
    );

    @Modifying(flushAutomatically = true)
    @Query("""
            update VehiclePlateHistory history
            set history.current = false
            where history.vehicle.vehicleId = :vehicleId
              and history.current = true
            """)
    int clearCurrentPlate(@Param("vehicleId") UUID vehicleId);
}

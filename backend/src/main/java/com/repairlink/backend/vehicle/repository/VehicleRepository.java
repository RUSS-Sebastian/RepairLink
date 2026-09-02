package com.repairlink.backend.vehicle.repository;

import com.repairlink.backend.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findAllByOwnerUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID ownerId
    );

    Optional<Vehicle> findByVehicleIdAndOwnerUserIdAndDeletedAtIsNull(
            UUID vehicleId,
            UUID ownerId
    );

    boolean existsByLicensePlateIgnoreCase(
            String licensePlate
    );

    boolean existsByLicensePlateIgnoreCaseAndVehicleIdNot(
            String licensePlate,
            UUID vehicleId
    );

    long countByOwnerUserIdAndDeletedAtIsNull(UUID ownerId);
}

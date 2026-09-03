package com.repairlink.backend.vehicle.service;

import com.repairlink.backend.common.enums.FuelType;
import com.repairlink.backend.common.enums.MileageUnit;
import com.repairlink.backend.common.enums.TransmissionType;
import com.repairlink.backend.common.enums.VehicleType;
import com.repairlink.backend.common.exception.LicensePlateAlreadyExistsException;
import com.repairlink.backend.common.exception.VehicleNotFoundException;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.vehicle.dto.CreateVehicleRequest;
import com.repairlink.backend.vehicle.dto.PlateHistoryResponse;
import com.repairlink.backend.vehicle.dto.UpdateVehicleRequest;
import com.repairlink.backend.vehicle.dto.VehicleDetailResponse;
import com.repairlink.backend.vehicle.dto.VehicleResponse;
import com.repairlink.backend.vehicle.entity.Vehicle;
import com.repairlink.backend.vehicle.entity.VehiclePlateHistory;
import com.repairlink.backend.vehicle.repository.VehiclePlateHistoryRepository;
import com.repairlink.backend.vehicle.repository.VehicleRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class VehicleService {

    private static final String DEFAULT_NICKNAME = "My Car";
    private static final long DEFAULT_MILEAGE = 0L;
    private static final MileageUnit DEFAULT_MILEAGE_UNIT = MileageUnit.MI;

    private final VehicleRepository vehicleRepository;
    private final VehiclePlateHistoryRepository plateHistoryRepository;
    private final UserAccountRepository userAccountRepository;

    public VehicleService(
            VehicleRepository vehicleRepository,
            VehiclePlateHistoryRepository plateHistoryRepository,
            UserAccountRepository userAccountRepository
    ) {
        this.vehicleRepository = vehicleRepository;
        this.plateHistoryRepository = plateHistoryRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> listVehicles(UUID ownerId) {
        return vehicleRepository
                .findAllByOwnerUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        ownerId
                )
                .stream()
                .map(this::toVehicleResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VehicleDetailResponse getVehicle(UUID ownerId, UUID vehicleId) {
        Vehicle vehicle = findOwnedActiveVehicle(ownerId, vehicleId);
        return toVehicleDetailResponse(vehicle);
    }

    @Transactional
    public VehicleDetailResponse createVehicle(
            UUID ownerId,
            CreateVehicleRequest request
    ) {
        UserAccount owner = userAccountRepository
                .findById(ownerId)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user no longer exists."
                ));

        String licensePlate = normalizeLicensePlate(request.licensePlate());
        assertLicensePlateAvailable(licensePlate, null);
        validateYear(request.year());

        Vehicle vehicle = new Vehicle();
        vehicle.setOwner(owner);
        vehicle.setNickname(normalizeNickname(request.nickname()));
        vehicle.setMake(normalizeRequiredText(request.make(), "Make"));
        vehicle.setModel(normalizeRequiredText(request.model(), "Model"));
        vehicle.setYear(request.year());
        vehicle.setLicensePlate(licensePlate);
        vehicle.setVehicleType(request.vehicleType());
        vehicle.setColor(normalizeRequiredText(request.color(), "Color"));
        vehicle.setCurrentMileage(
                request.currentMileage() == null
                        ? DEFAULT_MILEAGE
                        : request.currentMileage()
        );
        vehicle.setMileageUnit(
            request.mileageUnit() == null
                ? DEFAULT_MILEAGE_UNIT
                : request.mileageUnit()
        );

        applyPowertrain(
                vehicle,
                request.vehicleType(),
                request.fuelType(),
                request.transmission()
        );

        Vehicle savedVehicle = saveVehicle(vehicle);
        savePlateHistory(savedVehicle, licensePlate);

        return toVehicleDetailResponse(savedVehicle);
    }

    @Transactional
    public VehicleDetailResponse updateVehicle(
            UUID ownerId,
            UUID vehicleId,
            UpdateVehicleRequest request
    ) {
        Vehicle vehicle = findOwnedActiveVehicle(ownerId, vehicleId);

        if (request.nickname() != null) {
            vehicle.setNickname(normalizeNickname(request.nickname()));
        }
        if (request.make() != null) {
            vehicle.setMake(normalizeRequiredText(request.make(), "Make"));
        }
        if (request.model() != null) {
            vehicle.setModel(normalizeRequiredText(request.model(), "Model"));
        }
        if (request.year() != null) {
            validateYear(request.year());
            vehicle.setYear(request.year());
        }
        if (request.color() != null) {
            vehicle.setColor(normalizeRequiredText(request.color(), "Color"));
        }
        if (request.currentMileage() != null) {
            vehicle.setCurrentMileage(request.currentMileage());
        }
        if (request.mileageUnit() != null) {
            vehicle.setMileageUnit(request.mileageUnit());
        }

        VehicleType nextVehicleType = request.vehicleType() == null
                ? vehicle.getVehicleType()
                : request.vehicleType();
        FuelType nextFuelType = request.fuelType() == null
                ? vehicle.getFuelType()
                : request.fuelType();
        TransmissionType nextTransmission = request.transmission() == null
                ? vehicle.getTransmission()
                : request.transmission();

        applyPowertrain(
                vehicle,
                nextVehicleType,
                nextFuelType,
                nextTransmission
        );

        boolean plateChanged = false;
        String nextLicensePlate = vehicle.getLicensePlate();

        if (request.licensePlate() != null) {
            nextLicensePlate = normalizeLicensePlate(request.licensePlate());
            plateChanged = !nextLicensePlate.equalsIgnoreCase(
                    vehicle.getLicensePlate()
            );

            if (plateChanged) {
                assertLicensePlateAvailable(nextLicensePlate, vehicleId);
                vehicle.setLicensePlate(nextLicensePlate);
            }
        }

        Vehicle savedVehicle = saveVehicle(vehicle);

        if (plateChanged) {
            plateHistoryRepository.clearCurrentPlate(vehicleId);
            savePlateHistory(savedVehicle, nextLicensePlate);
        }

        return toVehicleDetailResponse(savedVehicle);
    }

    @Transactional
    public void deleteVehicle(UUID ownerId, UUID vehicleId) {
        Vehicle vehicle = findOwnedActiveVehicle(ownerId, vehicleId);
        vehicle.setDeletedAt(Instant.now());
        vehicleRepository.save(vehicle);
    }

    private Vehicle findOwnedActiveVehicle(UUID ownerId, UUID vehicleId) {
        return vehicleRepository
                .findByVehicleIdAndOwnerUserIdAndDeletedAtIsNull(
                        vehicleId,
                        ownerId
                )
                .orElseThrow(VehicleNotFoundException::new);
    }

    private Vehicle saveVehicle(Vehicle vehicle) {
        try {
            return vehicleRepository.saveAndFlush(vehicle);
        } catch (DataIntegrityViolationException exception) {
            throw new LicensePlateAlreadyExistsException();
        }
    }

    private void savePlateHistory(Vehicle vehicle, String licensePlate) {
        VehiclePlateHistory history = new VehiclePlateHistory();
        history.setVehicle(vehicle);
        history.setLicensePlate(licensePlate);
        history.setCurrent(true);
        plateHistoryRepository.save(history);
    }

    private void assertLicensePlateAvailable(
            String licensePlate,
            UUID currentVehicleId
    ) {
        boolean exists = currentVehicleId == null
                ? vehicleRepository
                        .existsByLicensePlateIgnoreCase(
                                licensePlate
                        )
                : vehicleRepository
                        .existsByLicensePlateIgnoreCaseAndVehicleIdNot(
                                licensePlate,
                                currentVehicleId
                        );

        if (exists) {
            throw new LicensePlateAlreadyExistsException();
        }
    }

    private void applyPowertrain(
            Vehicle vehicle,
            VehicleType vehicleType,
            FuelType fuelType,
            TransmissionType transmission
    ) {
        vehicle.setVehicleType(vehicleType);

        if (vehicleType == VehicleType.EV) {
            vehicle.setFuelType(null);
            vehicle.setTransmission(null);
            return;
        }

        if (fuelType == null) {
            throw new IllegalArgumentException(
                    "Fuel type is required for a normal car."
            );
        }

        if (transmission == null) {
            throw new IllegalArgumentException(
                    "Transmission is required for a normal car."
            );
        }

        vehicle.setFuelType(fuelType);
        vehicle.setTransmission(transmission);
    }

    private void validateYear(Integer year) {
        if (year == null) {
            throw new IllegalArgumentException("Year is required.");
        }

        int maximumYear = Year.now().getValue();
        if (year > maximumYear) {
            throw new IllegalArgumentException(
                    "Year cannot be later than " + maximumYear + "."
            );
        }
    }

    private String normalizeNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            return DEFAULT_NICKNAME;
        }
        return normalizeWhitespace(nickname);
    }

    private String normalizeRequiredText(String value, String fieldName) {
        String normalized = normalizeWhitespace(value);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank.");
        }
        return normalized;
    }

    private String normalizeLicensePlate(String licensePlate) {
        String normalized = normalizeRequiredText(
                licensePlate,
                "License plate"
        );
        return normalized.toUpperCase(Locale.ROOT);
    }

    private String normalizeWhitespace(String value) {
        return value.trim().replaceAll("\\s+", " ");
    }

    private VehicleResponse toVehicleResponse(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getVehicleId(),
                vehicle.getNickname(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getLicensePlate(),
                vehicle.getVehicleType(),
                vehicle.getFuelType(),
                vehicle.getTransmission(),
                vehicle.getColor(),
                vehicle.getCurrentMileage(),
                vehicle.getMileageUnit()
        );
    }

    private VehicleDetailResponse toVehicleDetailResponse(Vehicle vehicle) {
        List<PlateHistoryResponse> history = plateHistoryRepository
                .findAllByVehicleVehicleIdOrderByChangedAtDesc(
                        vehicle.getVehicleId()
                )
                .stream()
                .map(item -> new PlateHistoryResponse(
                        item.getLicensePlate(),
                        item.getChangedAt(),
                        item.isCurrent()
                ))
                .toList();

        return new VehicleDetailResponse(
                vehicle.getVehicleId(),
                vehicle.getNickname(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getLicensePlate(),
                vehicle.getVehicleType(),
                vehicle.getFuelType(),
                vehicle.getTransmission(),
                vehicle.getColor(),
                vehicle.getCurrentMileage(),
                vehicle.getMileageUnit(),
                history,
                vehicle.getCreatedAt(),
                vehicle.getUpdatedAt()
        );
    }
}

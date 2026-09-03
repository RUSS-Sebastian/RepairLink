package com.repairlink.backend.vehicle.service;

import com.repairlink.backend.common.enums.FuelType;
import com.repairlink.backend.common.enums.TransmissionType;
import com.repairlink.backend.common.enums.VehicleType;
import com.repairlink.backend.common.exception.VehicleNotFoundException;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.vehicle.dto.CreateVehicleRequest;
import com.repairlink.backend.vehicle.dto.UpdateVehicleRequest;
import com.repairlink.backend.vehicle.dto.VehicleDetailResponse;
import com.repairlink.backend.vehicle.entity.Vehicle;
import com.repairlink.backend.vehicle.entity.VehiclePlateHistory;
import com.repairlink.backend.vehicle.repository.VehiclePlateHistoryRepository;
import com.repairlink.backend.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTests {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehiclePlateHistoryRepository plateHistoryRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    private VehicleService vehicleService;

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleService(
                vehicleRepository,
                plateHistoryRepository,
                userAccountRepository
        );
    }

    @Test
    void createVehicleAppliesDefaultsAndCreatesCurrentPlateHistory() {
        UUID ownerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        UserAccount owner = new UserAccount();

        when(userAccountRepository.findById(ownerId))
                .thenReturn(Optional.of(owner));
        when(vehicleRepository
                .existsByLicensePlateIgnoreCase("SLV-4821"))
                .thenReturn(false);
        when(vehicleRepository.saveAndFlush(any(Vehicle.class)))
                .thenAnswer(invocation -> {
                    Vehicle vehicle = invocation.getArgument(0);
                    ReflectionTestUtils.setField(vehicle, "vehicleId", vehicleId);
                    vehicle.beforeInsert();
                    return vehicle;
                });
        when(plateHistoryRepository
                .findAllByVehicleVehicleIdOrderByChangedAtDesc(vehicleId))
                .thenReturn(List.of());

        VehicleDetailResponse response = vehicleService.createVehicle(
                ownerId,
                new CreateVehicleRequest(
                        " ",
                        " Toyota ",
                        " Corolla ",
                        2023,
                        " slv-4821 ",
                        VehicleType.NORMAL_CAR,
                        FuelType.PETROL,
                        TransmissionType.AUTOMATIC,
                        " Silver ",
                        null
                )
        );

        assertEquals("My Car", response.nickname());
        assertEquals(0L, response.currentMileage());
        assertEquals("SLV-4821", response.licensePlate());

        ArgumentCaptor<VehiclePlateHistory> historyCaptor =
                ArgumentCaptor.forClass(VehiclePlateHistory.class);
        verify(plateHistoryRepository).save(historyCaptor.capture());
        assertEquals("SLV-4821", historyCaptor.getValue().getLicensePlate());
        assertTrue(historyCaptor.getValue().isCurrent());
    }

    @Test
    void createEvStoresNoFuelTypeOrTransmission() {
        UUID ownerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();

        when(userAccountRepository.findById(ownerId))
                .thenReturn(Optional.of(new UserAccount()));
        when(vehicleRepository.saveAndFlush(any(Vehicle.class)))
                .thenAnswer(invocation -> {
                    Vehicle vehicle = invocation.getArgument(0);
                    ReflectionTestUtils.setField(vehicle, "vehicleId", vehicleId);
                    vehicle.beforeInsert();
                    return vehicle;
                });
        when(plateHistoryRepository
                .findAllByVehicleVehicleIdOrderByChangedAtDesc(vehicleId))
                .thenReturn(List.of());

        VehicleDetailResponse response = vehicleService.createVehicle(
                ownerId,
                new CreateVehicleRequest(
                        "EV Beast",
                        "Tesla",
                        "Model 3",
                        2024,
                        "EV-2024",
                        VehicleType.EV,
                        FuelType.PETROL,
                        TransmissionType.AUTOMATIC,
                        "Midnight Blue",
                        8200L
                )
        );

        assertEquals(VehicleType.EV, response.vehicleType());
        assertNull(response.fuelType());
        assertNull(response.transmission());
    }

    @Test
    void normalCarRequiresFuelTypeAndTransmission() {
        UUID ownerId = UUID.randomUUID();
        when(userAccountRepository.findById(ownerId))
                .thenReturn(Optional.of(new UserAccount()));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.createVehicle(
                        ownerId,
                        new CreateVehicleRequest(
                                null,
                                "Toyota",
                                "Corolla",
                                2023,
                                "SLV-4821",
                                VehicleType.NORMAL_CAR,
                                null,
                                TransmissionType.AUTOMATIC,
                                "Silver",
                                0L
                        )
                )
        );

        assertEquals(
                "Fuel type is required for a normal car.",
                exception.getMessage()
        );
        verify(vehicleRepository, never()).saveAndFlush(any(Vehicle.class));
    }

    @Test
    void futureYearBeyondNextYearIsRejected() {
        UUID ownerId = UUID.randomUUID();
        when(userAccountRepository.findById(ownerId))
                .thenReturn(Optional.of(new UserAccount()));

        int invalidYear = Year.now().getValue() + 2;

        assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.createVehicle(
                        ownerId,
                        new CreateVehicleRequest(
                                null,
                                "Toyota",
                                "Corolla",
                                invalidYear,
                                "SLV-4821",
                                VehicleType.NORMAL_CAR,
                                FuelType.PETROL,
                                TransmissionType.AUTOMATIC,
                                "Silver",
                                0L
                        )
                )
        );
    }

    @Test
    void nextYearIsRejected() {
        UUID ownerId = UUID.randomUUID();
        when(userAccountRepository.findById(ownerId))
                .thenReturn(Optional.of(new UserAccount()));

        int nextYear = Year.now().getValue() + 1;

        assertThrows(
                IllegalArgumentException.class,
                () -> vehicleService.createVehicle(
                        ownerId,
                        new CreateVehicleRequest(
                                null,
                                "Toyota",
                                "Corolla",
                                nextYear,
                                "SLV-4821",
                                VehicleType.NORMAL_CAR,
                                FuelType.PETROL,
                                TransmissionType.AUTOMATIC,
                                "Silver",
                                0L
                        )
                )
        );
    }

    @Test
    void anotherOwnersVehicleIsHiddenAsNotFound() {
        UUID ownerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        when(vehicleRepository
                .findByVehicleIdAndOwnerUserIdAndDeletedAtIsNull(
                        vehicleId,
                        ownerId
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                VehicleNotFoundException.class,
                () -> vehicleService.getVehicle(ownerId, vehicleId)
        );
    }

    @Test
    void licensePlateEditCreatesHistoryAndCanBeTheOnlyChangedField() {
        UUID ownerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        Vehicle vehicle = normalVehicle(vehicleId);

        when(vehicleRepository
                .findByVehicleIdAndOwnerUserIdAndDeletedAtIsNull(
                        vehicleId,
                        ownerId
                ))
                .thenReturn(Optional.of(vehicle));
        when(vehicleRepository.saveAndFlush(vehicle)).thenReturn(vehicle);
        when(plateHistoryRepository
                .findAllByVehicleVehicleIdOrderByChangedAtDesc(vehicleId))
                .thenReturn(List.of());

        VehicleDetailResponse response = vehicleService.updateVehicle(
                ownerId,
                vehicleId,
                new UpdateVehicleRequest(
                        null,
                        null,
                        null,
                        null,
                        "new-9001",
                        null,
                        null,
                        null,
                        null,
                        null
                )
        );

        assertEquals("NEW-9001", response.licensePlate());
        verify(plateHistoryRepository).clearCurrentPlate(vehicleId);
        verify(plateHistoryRepository).save(any(VehiclePlateHistory.class));
    }

    @Test
    void deleteIsSoftAndOwnerScoped() {
        UUID ownerId = UUID.randomUUID();
        UUID vehicleId = UUID.randomUUID();
        Vehicle vehicle = normalVehicle(vehicleId);

        when(vehicleRepository
                .findByVehicleIdAndOwnerUserIdAndDeletedAtIsNull(
                        vehicleId,
                        ownerId
                ))
                .thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(ownerId, vehicleId);

        assertNotNull(vehicle.getDeletedAt());
        verify(vehicleRepository).save(vehicle);
    }

    private Vehicle normalVehicle(UUID vehicleId) {
        Vehicle vehicle = new Vehicle();
        ReflectionTestUtils.setField(vehicle, "vehicleId", vehicleId);
        vehicle.setNickname("Daily Driver");
        vehicle.setMake("Toyota");
        vehicle.setModel("Corolla");
        vehicle.setYear(2023);
        vehicle.setLicensePlate("SLV-4821");
        vehicle.setVehicleType(VehicleType.NORMAL_CAR);
        vehicle.setFuelType(FuelType.PETROL);
        vehicle.setTransmission(TransmissionType.AUTOMATIC);
        vehicle.setColor("Silver");
        vehicle.setCurrentMileage(24850L);
        vehicle.beforeInsert();
        return vehicle;
    }
}

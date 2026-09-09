package com.repairlink.backend.schedule;

import com.repairlink.backend.common.enums.FuelType;
import com.repairlink.backend.common.enums.MileageUnit;
import com.repairlink.backend.common.enums.TransmissionType;
import com.repairlink.backend.common.enums.VehicleType;
import com.repairlink.backend.schedule.dto.AdminDailySlotsResponse;
import com.repairlink.backend.schedule.dto.AdminSlotDto;
import com.repairlink.backend.schedule.entity.ScheduleConfiguration;
import com.repairlink.backend.schedule.entity.ScheduleStatus;
import com.repairlink.backend.schedule.repository.ScheduleConfigurationRepository;
import com.repairlink.backend.schedule.service.ScheduleService;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.serviceRequest.entity.HandoverMethod;
import com.repairlink.backend.serviceRequest.entity.ServiceRequest;
import com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus;
import com.repairlink.backend.serviceRequest.repository.ServiceRequestRepository;
import com.repairlink.backend.vehicle.entity.Vehicle;
import com.repairlink.backend.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AdminDailySlotsIntegrationTest {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private ScheduleConfigurationRepository configRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Test
    void testGetAdminDailySlots_CapacityAndBookingCalculation() {
        ScheduleConfiguration config = configRepository.findFirstByStatus(ScheduleStatus.CURRENT)
                .orElseGet(() -> configRepository.findAll().get(0));

        UUID configId = config.getConfigurationId();
        LocalDate testDate = config.getStartDate();
        int expectedCapacity = (config.getSlotCapacity() != null && config.getSlotCapacity() > 0) ? config.getSlotCapacity() : 1;

        AdminDailySlotsResponse response = scheduleService.getAdminDailySlots(configId, testDate);

        assertNotNull(response);
        assertEquals(testDate, response.date());
        assertEquals(expectedCapacity, response.slotCapacity());
        assertFalse(response.slots().isEmpty());

        // Find a non-break slot
        AdminSlotDto nonBreakSlot = response.slots().stream()
                .filter(s -> !s.isBreak())
                .findFirst()
                .orElseThrow(() -> new AssertionError("No non-break slots found"));

        assertEquals(expectedCapacity, nonBreakSlot.totalCapacity());
        assertEquals(0, nonBreakSlot.bookedCapacity());
        assertEquals(expectedCapacity, nonBreakSlot.remainingCapacity());
        assertEquals("AVAILABLE", nonBreakSlot.status());

        // Find break slot if any
        response.slots().stream()
                .filter(AdminSlotDto::isBreak)
                .findFirst()
                .ifPresent(breakSlot -> {
                    assertTrue(breakSlot.isBreak());
                    assertEquals("BREAK", breakSlot.status());
                    assertEquals(0, breakSlot.totalCapacity());
                    assertEquals(0, breakSlot.bookedCapacity());
                    assertEquals(0, breakSlot.remainingCapacity());
                });

        // Now create a confirmed service request to book 1 spot
        UserAccount customer = userAccountRepository.findAll().stream()
                .findFirst()
                .orElseThrow();

        Vehicle vehicle = vehicleRepository.findAll().stream().findFirst().orElseGet(() -> {
            Vehicle v = new Vehicle();
            v.setOwner(customer);
            v.setNickname("Daily Driver");
            v.setMake("Toyota");
            v.setModel("Camry");
            v.setYear(2022);
            v.setLicensePlate("TEST-" + UUID.randomUUID().toString().substring(0, 6));
            v.setColor("Black");
            v.setVehicleType(VehicleType.NORMAL_CAR);
            v.setFuelType(FuelType.PETROL);
            v.setTransmission(TransmissionType.AUTOMATIC);
            return vehicleRepository.save(v);
        });

        ServiceRequest request1 = new ServiceRequest();
        request1.setRequestCode(serviceRequestRepository.getNextRequestCode());
        request1.setCustomer(customer);
        request1.setVehicle(vehicle);
        request1.setProblemDescription("Brake inspection required for annual service.");
        request1.setPreferredDate(testDate);
        request1.setPreferredTimeSlot(nonBreakSlot.label());
        request1.setHandoverMethod(HandoverMethod.DROP_OFF);
        request1.setStatus(ServiceRequestStatus.PENDING_REVIEW);
        serviceRequestRepository.save(request1);

        // Re-query admin daily slots
        AdminDailySlotsResponse afterBooking1 = scheduleService.getAdminDailySlots(configId, testDate);
        AdminSlotDto bookedSlot1 = afterBooking1.slots().stream()
                .filter(s -> s.label().equals(nonBreakSlot.label()))
                .findFirst()
                .orElseThrow();

        assertEquals(1, bookedSlot1.bookedCapacity());
        assertEquals(expectedCapacity - 1, bookedSlot1.remainingCapacity());
        if (expectedCapacity == 1) {
            assertEquals("UNAVAILABLE", bookedSlot1.status());
        } else {
            assertEquals("AVAILABLE", bookedSlot1.status());
        }

        // If capacity is 2 or more, book another request until capacity is full
        for (int i = 2; i <= expectedCapacity; i++) {
            ServiceRequest requestN = new ServiceRequest();
            requestN.setRequestCode(serviceRequestRepository.getNextRequestCode());
            requestN.setCustomer(customer);
            requestN.setVehicle(vehicle);
            requestN.setProblemDescription("Additional service request problem description.");
            requestN.setPreferredDate(testDate);
            requestN.setPreferredTimeSlot(nonBreakSlot.label());
            requestN.setHandoverMethod(HandoverMethod.DROP_OFF);
            requestN.setStatus(ServiceRequestStatus.PENDING_REVIEW);
            serviceRequestRepository.save(requestN);
        }

        // Re-query when capacity is completely full
        AdminDailySlotsResponse fullResponse = scheduleService.getAdminDailySlots(configId, testDate);
        AdminSlotDto fullSlot = fullResponse.slots().stream()
                .filter(s -> s.label().equals(nonBreakSlot.label()))
                .findFirst()
                .orElseThrow();

        assertEquals(expectedCapacity, fullSlot.bookedCapacity());
        assertEquals(0, fullSlot.remainingCapacity());
        assertEquals("UNAVAILABLE", fullSlot.status(), "Fully booked slot must have status UNAVAILABLE");
    }
}

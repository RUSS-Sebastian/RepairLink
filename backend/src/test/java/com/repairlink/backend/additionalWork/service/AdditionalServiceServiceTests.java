package com.repairlink.backend.additionalWork.service;

import com.repairlink.backend.additionalWork.dto.AdditionalServiceResponse;
import com.repairlink.backend.additionalWork.dto.CreateAdditionalServiceRequest;
import com.repairlink.backend.additionalWork.dto.UpdateAdditionalServiceRequest;
import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.entity.ServiceApplicability;
import com.repairlink.backend.additionalWork.repository.AdditionalServiceRepository;
import com.repairlink.backend.common.exception.AdditionalServiceNameAlreadyExistsException;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdditionalServiceServiceTests {

    @Mock
    private AdditionalServiceRepository repository;

    @Mock
    private UserAccountRepository userAccountRepository;

    private AdditionalServiceService service;

    @BeforeEach
    void setUp() {
        service = new AdditionalServiceService(repository, userAccountRepository);
    }

    @Test
    void createDefaultsToActiveAndNormalizesText() {
        UUID adminId = UUID.randomUUID();
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(new UserAccount()));
        when(repository.saveAndFlush(any(AdditionalService.class))).thenAnswer(invocation -> {
            AdditionalService saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "additionalServiceId", UUID.randomUUID());
            saved.beforeInsert();
            return saved;
        });

        AdditionalServiceResponse response = service.create(
                adminId,
                new CreateAdditionalServiceRequest(
                        "  Interior   Cleaning  ",
                        "  Vacuum   and clean.  ",
                        new BigDecimal("50000"),
                        ServiceApplicability.BOTH
                )
        );

        assertEquals("Interior Cleaning", response.name());
        assertEquals("Vacuum and clean.", response.description());
        assertEquals(AdditionalServiceStatus.ACTIVE, response.status());
    }

    @Test
    void duplicateNameIsRejectedCaseInsensitively() {
        when(repository.existsByNameIgnoreCase("Car Wash")).thenReturn(true);

        assertThrows(
                AdditionalServiceNameAlreadyExistsException.class,
                () -> service.create(
                        UUID.randomUUID(),
                        new CreateAdditionalServiceRequest(
                                "Car Wash",
                                null,
                                new BigDecimal("30000"),
                                ServiceApplicability.BOTH
                        )
                )
        );

        verify(repository, never()).saveAndFlush(any(AdditionalService.class));
    }

    @Test
    void editCanArchiveAndRestoreAService() {
        UUID adminId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        AdditionalService entity = existingService(serviceId);
        when(repository.findById(serviceId)).thenReturn(Optional.of(entity));
        when(userAccountRepository.findById(adminId)).thenReturn(Optional.of(new UserAccount()));
        when(repository.saveAndFlush(entity)).thenAnswer(invocation -> invocation.getArgument(0));

        AdditionalServiceResponse archived = service.update(
                adminId,
                serviceId,
                new UpdateAdditionalServiceRequest(
                        "Car Wash",
                        "Standard wash",
                        new BigDecimal("35000"),
                        ServiceApplicability.BOTH,
                        AdditionalServiceStatus.ARCHIVED
                )
        );

        assertEquals(AdditionalServiceStatus.ARCHIVED, archived.status());
        assertNotNull(entity.getArchivedAt());

        AdditionalServiceResponse restored = service.changeStatus(
                adminId,
                serviceId,
                AdditionalServiceStatus.ACTIVE
        );

        assertEquals(AdditionalServiceStatus.ACTIVE, restored.status());
        assertNull(entity.getArchivedAt());
    }

    private AdditionalService existingService(UUID serviceId) {
        AdditionalService entity = new AdditionalService();
        ReflectionTestUtils.setField(entity, "additionalServiceId", serviceId);
        entity.setName("Car Wash");
        entity.setDescription("Standard wash");
        entity.setPrice(new BigDecimal("30000"));
        entity.setApplicability(ServiceApplicability.BOTH);
        entity.setStatus(AdditionalServiceStatus.ACTIVE);
        entity.beforeInsert();
        return entity;
    }
}

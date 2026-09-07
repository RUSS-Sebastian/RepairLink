package com.repairlink.backend.additionalWork.service;

import com.repairlink.backend.additionalWork.dto.AdditionalServicePageResponse;
import com.repairlink.backend.additionalWork.dto.AdditionalServiceResponse;
import com.repairlink.backend.additionalWork.dto.CreateAdditionalServiceRequest;
import com.repairlink.backend.additionalWork.dto.UpdateAdditionalServiceRequest;
import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.entity.ServiceApplicability;
import com.repairlink.backend.additionalWork.repository.AdditionalServiceRepository;
import com.repairlink.backend.common.exception.AdditionalServiceNameAlreadyExistsException;
import com.repairlink.backend.common.exception.AdditionalServiceNotFoundException;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdditionalServiceService {

    private final AdditionalServiceRepository repository;
    private final UserAccountRepository userAccountRepository;

    public AdditionalServiceService(
            AdditionalServiceRepository repository,
            UserAccountRepository userAccountRepository
    ) {
        this.repository = repository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public AdditionalServicePageResponse list(
            String search,
            String status,
            String applicability,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<AdditionalService> result = repository.search(
                search == null ? "" : search.trim(),
                normalizeEnumFilter(status, AdditionalServiceStatus.class),
                normalizeEnumFilter(applicability, ServiceApplicability.class),
                PageRequest.of(safePage, safeSize, Sort.by("name").ascending())
        );

        return new AdditionalServicePageResponse(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                new AdditionalServicePageResponse.Summary(
                        repository.count(),
                        repository.countByStatus(AdditionalServiceStatus.ACTIVE),
                        repository.countByStatus(AdditionalServiceStatus.INACTIVE),
                        repository.countByStatus(AdditionalServiceStatus.ARCHIVED)
                )
        );
    }

    @Transactional
    public AdditionalServiceResponse create(UUID adminId, CreateAdditionalServiceRequest request) {
        String name = normalizeRequired(request.name());
        assertNameAvailable(name, null);
        UserAccount admin = findUser(adminId);

        AdditionalService service = new AdditionalService();
        service.setName(name);
        service.setDescription(normalizeOptional(request.description()));
        service.setPrice(request.price());
        service.setApplicability(request.applicability());
        service.setStatus(AdditionalServiceStatus.ACTIVE);
        service.setCreatedBy(admin);
        service.setUpdatedBy(admin);
        return save(service);
    }

    @Transactional
    public AdditionalServiceResponse update(
            UUID adminId,
            UUID serviceId,
            UpdateAdditionalServiceRequest request
    ) {
        AdditionalService service = findService(serviceId);
        String name = normalizeRequired(request.name());
        assertNameAvailable(name, serviceId);

        service.setName(name);
        service.setDescription(normalizeOptional(request.description()));
        service.setPrice(request.price());
        service.setApplicability(request.applicability());
        applyStatus(service, request.status());
        service.setUpdatedBy(findUser(adminId));
        return save(service);
    }

    @Transactional
    public AdditionalServiceResponse changeStatus(
            UUID adminId,
            UUID serviceId,
            AdditionalServiceStatus status
    ) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required.");
        }
        AdditionalService service = findService(serviceId);
        applyStatus(service, status);
        service.setUpdatedBy(findUser(adminId));
        return save(service);
    }

    private void applyStatus(AdditionalService service, AdditionalServiceStatus status) {
        service.setStatus(status);
        service.setArchivedAt(status == AdditionalServiceStatus.ARCHIVED ? Instant.now() : null);
    }

    private AdditionalService findService(UUID serviceId) {
        return repository.findById(serviceId)
                .orElseThrow(AdditionalServiceNotFoundException::new);
    }

    private UserAccount findUser(UUID userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
    }

    private void assertNameAvailable(String name, UUID serviceId) {
        boolean exists = serviceId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndAdditionalServiceIdNot(name, serviceId);
        if (exists) {
            throw new AdditionalServiceNameAlreadyExistsException();
        }
    }

    private AdditionalServiceResponse save(AdditionalService service) {
        try {
            return toResponse(repository.saveAndFlush(service));
        } catch (DataIntegrityViolationException exception) {
            throw new AdditionalServiceNameAlreadyExistsException();
        }
    }

    private <E extends Enum<E>> E normalizeEnumFilter(String value, Class<E> enumType) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("ALL")) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        try {
            return Enum.valueOf(enumType, normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid filter value: " + value + ".");
        }
    }

    private String normalizeRequired(String value) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new IllegalArgumentException("Service name is required.");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private AdditionalServiceResponse toResponse(AdditionalService service) {
        return new AdditionalServiceResponse(
                service.getAdditionalServiceId(),
                service.getName(),
                service.getDescription(),
                service.getPrice(),
                service.getApplicability(),
                service.getStatus(),
                service.getCreatedAt(),
                service.getUpdatedAt()
        );
    }
}

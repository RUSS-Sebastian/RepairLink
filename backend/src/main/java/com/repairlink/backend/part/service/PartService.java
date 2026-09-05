package com.repairlink.backend.part.service;

import com.repairlink.backend.common.exception.PartNotFoundException;
import com.repairlink.backend.common.exception.PartNumberAlreadyExistsException;
import com.repairlink.backend.part.dto.PartRequest;
import com.repairlink.backend.part.dto.PartPageResponse;
import com.repairlink.backend.part.dto.PartResponse;
import com.repairlink.backend.part.entity.Part;
import com.repairlink.backend.part.entity.PartStatus;
import com.repairlink.backend.part.repository.PartRepository;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PartService {

    private final PartRepository partRepository;
    private final UserAccountRepository userAccountRepository;

    public PartService(
            PartRepository partRepository,
            UserAccountRepository userAccountRepository
    ) {
        this.partRepository = partRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
        public PartPageResponse listParts(
            String search,
            String status,
            boolean lowStock,
            int page,
            int size
        ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String normalizedSearch = search == null ? "" : search.trim();
        String normalizedStatus = normalizeFilterStatus(status);
        Page<Part> result = partRepository.search(
            normalizedSearch,
            normalizedStatus,
            lowStock,
            PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return new PartPageResponse(
            result.getContent().stream().map(this::toResponse).toList(),
            result.getNumber(),
            result.getSize(),
            result.getTotalElements(),
            result.getTotalPages(),
            new PartPageResponse.PartSummary(
                partRepository.count(),
                partRepository.countByStatusAndStockQuantityGreaterThan(
                    PartStatus.ACTIVE, 0
                ),
                partRepository.countLowStock(),
                partRepository.countByStatusAndStockQuantity(
                    PartStatus.ACTIVE, 0
                )
            )
        );
    }

    private String normalizeFilterStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) {
            return "";
        }
        return status.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    @Transactional
    public PartResponse createPart(UUID userId, PartRequest request) {
        String partNumber = normalizePartNumber(request.partNumber());
        assertPartNumberAvailable(partNumber, null);
        UserAccount user = findUser(userId);

        Part part = new Part();
        apply(part, request, partNumber);
        part.setCreatedBy(user);
        part.setUpdatedBy(user);
        return save(part);
    }

    @Transactional
    public PartResponse updatePart(UUID userId, UUID partId, PartRequest request) {
        Part part = partRepository.findById(partId)
                .orElseThrow(PartNotFoundException::new);
        if (part.getStatus() == PartStatus.ARCHIVED) {
            throw new IllegalArgumentException(
                "Archived parts cannot be edited."
            );
        }
        String partNumber = normalizePartNumber(request.partNumber());
        assertPartNumberAvailable(partNumber, partId);
        apply(part, request, partNumber);
        part.setUpdatedBy(findUser(userId));
        return save(part);
    }

    @Transactional
    public PartResponse updateStatus(UUID userId, UUID partId, String status) {
        Part part = partRepository.findById(partId)
                .orElseThrow(PartNotFoundException::new);
        PartStatus nextStatus = parseStatus(status, true);
        if (part.getStatus() == PartStatus.ARCHIVED
            && nextStatus != PartStatus.ARCHIVED) {
            throw new IllegalArgumentException(
                "Archived parts cannot be reactivated."
            );
        }
        part.setStatus(nextStatus);
        part.setUpdatedBy(findUser(userId));
        part.setArchivedAt(nextStatus == PartStatus.ARCHIVED ? Instant.now() : null);
        return save(part);
    }

    private void apply(Part part, PartRequest request, String partNumber) {
        part.setName(normalizeRequired(request.name(), "Part name"));
        part.setBrand(normalizeRequired(request.brand(), "Brand"));
        part.setPartNumber(partNumber);
        part.setDescription(normalizeOptional(request.description()));
        part.setSupplierName(normalizeOptional(request.source()));
        part.setWarrantyMonths(request.warranty());
        part.setPrice(request.price());
        part.setStockQuantity(request.stock());
        part.setReorderLevel(request.reorderLevel());
        PartStatus status = parseStatus(request.status(), false);
        part.setStatus(status);
        if (status != PartStatus.ARCHIVED) {
            part.setArchivedAt(null);
        }
    }

    private PartResponse save(Part part) {
        try {
            return toResponse(partRepository.saveAndFlush(part));
        } catch (DataIntegrityViolationException exception) {
            throw new PartNumberAlreadyExistsException();
        }
    }

    private void assertPartNumberAvailable(String partNumber, UUID partId) {
        boolean exists = partId == null
                ? partRepository.existsByPartNumber(partNumber)
                : partRepository.existsByPartNumberAndPartIdNot(partNumber, partId);
        if (exists) {
            throw new PartNumberAlreadyExistsException();
        }
    }

    private UserAccount findUser(UUID userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user no longer exists."
                ));
    }

    private PartStatus parseStatus(String value, boolean allowArchived) {
        if (value == null || value.isBlank()) {
            return PartStatus.ACTIVE;
        }
        try {
            PartStatus status = PartStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
            if (!allowArchived && status == PartStatus.ARCHIVED) {
                throw new IllegalArgumentException("Archived status is not allowed when creating or editing a part.");
            }
            return status;
        } catch (IllegalArgumentException exception) {
            if (exception.getMessage() != null && exception.getMessage().startsWith("Archived")) {
                throw exception;
            }
            throw new IllegalArgumentException("Status must be Active or Inactive.");
        }
    }

    private String normalizePartNumber(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = normalizeOptional(value);
        if (normalized == null || normalized.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank.");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private PartResponse toResponse(Part part) {
        String effectiveStatus = part.getStatus() == PartStatus.ARCHIVED
                ? "Archived"
                : part.getStatus() == PartStatus.INACTIVE
                    ? "Inactive"
                    : part.getStockQuantity() == 0 ? "Out of Stock" : "Active";
        return new PartResponse(
                part.getPartId(), part.getName(), part.getBrand(), part.getPartNumber(),
                part.getDescription(), part.getSupplierName(), part.getWarrantyMonths(),
                part.getPrice(), part.getStockQuantity(), part.getReorderLevel(),
                titleCase(part.getStatus().name()), effectiveStatus,
                part.getCreatedAt(), part.getUpdatedAt()
        );
    }

    private String titleCase(String value) {
        return value.charAt(0) + value.substring(1).toLowerCase(Locale.ROOT);
    }
}
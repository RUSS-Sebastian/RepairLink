package com.repairlink.backend.additionalWork.controller;

import com.repairlink.backend.additionalWork.entity.AdditionalService;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.entity.ServiceApplicability;
import com.repairlink.backend.additionalWork.repository.AdditionalServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer/additional-services")
public class CustomerAdditionalServiceController {

    private final AdditionalServiceRepository repository;

    public CustomerAdditionalServiceController(AdditionalServiceRepository repository) {
        this.repository = repository;
    }

    public record CustomerServiceDto(
            UUID id,
            String name,
            String description,
            BigDecimal price,
            String applicability
    ) {}

    @GetMapping
    public ResponseEntity<List<CustomerServiceDto>> list(
            @RequestParam(required = false) String vehicleType
    ) {
        List<AdditionalService> services;

        if (vehicleType != null && !vehicleType.isBlank()) {
            try {
                ServiceApplicability type = ServiceApplicability.valueOf(vehicleType.toUpperCase());
                services = repository.findByStatusAndApplicabilityInOrderByNameAsc(
                        AdditionalServiceStatus.ACTIVE,
                        List.of(type, ServiceApplicability.BOTH)
                );
            } catch (IllegalArgumentException e) {
                services = repository.findByStatusOrderByNameAsc(AdditionalServiceStatus.ACTIVE);
            }
        } else {
            services = repository.findByStatusOrderByNameAsc(AdditionalServiceStatus.ACTIVE);
        }

        List<CustomerServiceDto> dtos = services.stream()
                .map(s -> new CustomerServiceDto(
                        s.getAdditionalServiceId(),
                        s.getName(),
                        s.getDescription(),
                        s.getPrice(),
                        s.getApplicability().name()
                ))
                .toList();

        return ResponseEntity.ok(dtos);
    }
}

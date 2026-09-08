package com.repairlink.backend.serviceRequest.repository;

import com.repairlink.backend.serviceRequest.entity.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, UUID> {
    Page<ServiceRequest> findByCustomerUserIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
}

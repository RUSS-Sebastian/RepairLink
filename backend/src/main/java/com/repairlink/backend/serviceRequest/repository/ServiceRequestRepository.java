package com.repairlink.backend.serviceRequest.repository;

import com.repairlink.backend.serviceRequest.entity.ServiceRequest;
import com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, UUID> {
    Page<ServiceRequest> findByCustomerUserIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
    List<ServiceRequest> findByCustomerUserIdOrderByCreatedAtDesc(UUID customerId);
    boolean existsByVehicleVehicleIdAndStatusNotIn(UUID vehicleId, Collection<ServiceRequestStatus> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(sr) FROM ServiceRequest sr WHERE sr.preferredDate = :date AND sr.preferredTimeSlot = :timeSlot AND sr.status NOT IN (com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus.CANCELLED, com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus.REJECTED)")
    long countActiveBookingsByDateAndTimeSlot(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date, @org.springframework.data.repository.query.Param("timeSlot") String timeSlot);

    @org.springframework.data.jpa.repository.Query(value = "SELECT 'REQ-' || LPAD(NEXTVAL('service_request_code_seq')::text, 4, '0')", nativeQuery = true)
    String getNextRequestCode();

    java.util.Optional<ServiceRequest> findByRequestCode(String requestCode);

    @org.springframework.data.jpa.repository.Query("SELECT sr.preferredTimeSlot, COUNT(sr) FROM ServiceRequest sr WHERE sr.preferredDate = :date AND sr.status NOT IN (com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus.CANCELLED, com.repairlink.backend.serviceRequest.entity.ServiceRequestStatus.REJECTED) GROUP BY sr.preferredTimeSlot")
    List<Object[]> countActiveBookingsByDateGroupByTimeSlot(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);
}

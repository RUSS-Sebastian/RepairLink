package com.repairlink.backend.serviceRequest.repository;

import com.repairlink.backend.serviceRequest.entity.ServiceRequestPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceRequestPhotoRepository extends JpaRepository<ServiceRequestPhoto, UUID> {
}

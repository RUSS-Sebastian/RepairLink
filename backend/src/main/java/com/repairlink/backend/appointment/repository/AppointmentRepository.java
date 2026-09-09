package com.repairlink.backend.appointment.repository;

import com.repairlink.backend.appointment.entity.Appointment;
import com.repairlink.backend.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByCustomer_UserIdAndStatusOrderByAppointmentDateAsc(UUID customerId, AppointmentStatus status);

    List<Appointment> findByCustomer_UserIdOrderByCreatedAtDesc(UUID customerId);

    Optional<Appointment> findByAppointmentIdAndCustomer_UserId(UUID appointmentId, UUID customerId);

    Optional<Appointment> findByServiceRequest_ServiceRequestId(UUID serviceRequestId);

    Optional<Appointment> findByAppointmentCode(String appointmentCode);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date AND a.status IN (com.repairlink.backend.appointment.entity.AppointmentStatus.CONFIRMED, com.repairlink.backend.appointment.entity.AppointmentStatus.ARRIVED) ORDER BY a.timeSlot ASC, a.createdAt ASC")
    List<Appointment> findConfirmedAppointmentsByDate(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);

    List<Appointment> findByCustomer_UserIdAndStatusInOrderByAppointmentDateAsc(UUID customerId, java.util.Collection<AppointmentStatus> statuses);

    @Query("SELECT a.appointmentDate, COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate AND a.status IN (com.repairlink.backend.appointment.entity.AppointmentStatus.CONFIRMED, com.repairlink.backend.appointment.entity.AppointmentStatus.ARRIVED) GROUP BY a.appointmentDate")
    List<Object[]> countAppointmentsByDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @Query(value = "SELECT 'APT-' || LPAD(NEXTVAL('appointment_code_seq')::text, 4, '0')", nativeQuery = true)
    String getNextAppointmentCode();
}

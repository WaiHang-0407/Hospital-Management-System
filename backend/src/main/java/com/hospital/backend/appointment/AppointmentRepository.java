package com.hospital.backend.appointment;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findAllByOrderByAppointmentDateDescAppointmentTimeDesc();

    List<Appointment> findByPatientUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(String email);

    List<Appointment> findByDoctorUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(String email);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusOrderByAppointmentTimeAsc(UUID doctorId, LocalDate appointmentDate, String status);

    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatus(UUID doctorId, LocalDate appointmentDate, LocalTime appointmentTime, String status);

    @Query("""
            select count(a) > 0
            from Appointment a
            where a.doctor.id = :doctorId
              and a.appointmentDate = :appointmentDate
              and a.appointmentTime = :appointmentTime
              and a.status = 'PENDING'
              and a.id <> :excludedAppointmentId
            """)
    boolean existsPendingDoctorSlotExcludingAppointment(
            @Param("doctorId") UUID doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("appointmentTime") LocalTime appointmentTime,
            @Param("excludedAppointmentId") UUID excludedAppointmentId
    );
}

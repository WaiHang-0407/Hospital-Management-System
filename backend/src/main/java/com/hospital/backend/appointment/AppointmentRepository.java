package com.hospital.backend.appointment;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(String email);

    List<Appointment> findByDoctorUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(String email);

    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(UUID doctorId, LocalDate appointmentDate, LocalTime appointmentTime);
}

package com.hospital.backend.prescription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    boolean existsByAppointmentId(UUID appointmentId);

    Optional<Prescription> findByAppointmentId(UUID appointmentId);

    List<Prescription> findByPatientUserEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    List<Prescription> findByDoctorUserEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}

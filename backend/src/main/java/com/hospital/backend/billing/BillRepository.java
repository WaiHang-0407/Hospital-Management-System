package com.hospital.backend.billing;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, UUID> {

    boolean existsByAppointmentId(UUID appointmentId);

    Optional<Bill> findByAppointmentId(UUID appointmentId);

    List<Bill> findAllByOrderByCreatedAtDesc();

    List<Bill> findByPatientUserEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}

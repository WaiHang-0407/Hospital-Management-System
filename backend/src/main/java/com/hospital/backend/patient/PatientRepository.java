package com.hospital.backend.patient;

import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByUserEmailIgnoreCase(String email);

    boolean existsByUserId(UUID userId);

    List<Patient> findAllByUserEnabledTrueOrderByUserFullNameAsc();
}

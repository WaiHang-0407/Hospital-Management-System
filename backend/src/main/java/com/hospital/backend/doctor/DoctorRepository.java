package com.hospital.backend.doctor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);

    Optional<Doctor> findByUserEmailIgnoreCase(String email);

    void deleteByUserId(UUID userId);

    List<Doctor> findBySpecializationIgnoreCaseAndUserEnabledTrueOrderByUserFullNameAsc(String specialization);
}

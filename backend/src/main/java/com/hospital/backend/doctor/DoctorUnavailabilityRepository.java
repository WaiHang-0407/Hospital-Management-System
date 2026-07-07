package com.hospital.backend.doctor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorUnavailabilityRepository extends JpaRepository<DoctorUnavailability, UUID> {

    boolean existsByDoctorIdAndUnavailableDateAndStartTime(UUID doctorId, LocalDate unavailableDate, LocalTime startTime);

    List<DoctorUnavailability> findByDoctorIdOrderByUnavailableDateAscStartTimeAsc(UUID doctorId);

    List<DoctorUnavailability> findByDoctorIdAndUnavailableDateOrderByStartTimeAsc(UUID doctorId, LocalDate unavailableDate);

    void deleteByIdAndDoctorId(UUID id, UUID doctorId);
}

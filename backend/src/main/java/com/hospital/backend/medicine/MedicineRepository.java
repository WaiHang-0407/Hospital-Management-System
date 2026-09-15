package com.hospital.backend.medicine;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineRepository extends JpaRepository<Medicine, UUID> {

    List<Medicine> findAllByOrderByNameAsc();

    List<Medicine> findByActiveTrueOrderByNameAsc();

    Optional<Medicine> findFirstByNameIgnoreCase(String name);
}

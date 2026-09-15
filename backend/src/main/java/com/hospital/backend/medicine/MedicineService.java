package com.hospital.backend.medicine;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        var medicine = new Medicine();
        medicine.setName(request.name());
        medicine.setCategory(request.category());
        medicine.setStrength(request.strength());
        medicine.setUnit(request.unit());
        medicine.setStockQuantity(request.stockQuantity());
        medicine.setPrice(request.price() == null ? BigDecimal.ZERO : request.price());

        return toResponse(medicineRepository.save(medicine));
    }

    public List<MedicineResponse> medicines() {
        return medicineRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MedicineResponse> activeMedicines() {
        return medicineRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MedicineResponse updateMedicine(UUID id, MedicineRequest request) {
        var medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found"));

        medicine.setName(request.name());
        medicine.setCategory(request.category());
        medicine.setStrength(request.strength());
        medicine.setUnit(request.unit());
        medicine.setStockQuantity(request.stockQuantity());
        medicine.setPrice(request.price() == null ? BigDecimal.ZERO : request.price());

        return toResponse(medicine);
    }

    @Transactional
    public void deleteMedicine(UUID id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found");
        }

        medicineRepository.deleteById(id);
    }

    private MedicineResponse toResponse(Medicine medicine) {
        return new MedicineResponse(
                medicine.getId(),
                medicine.getName(),
                medicine.getCategory(),
                medicine.getStrength(),
                medicine.getUnit(),
                medicine.getStockQuantity(),
                medicine.getPrice(),
                medicine.isActive(),
                medicine.getCreatedAt()
        );
    }
}

package com.hospital.backend.medicine;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping("/api/medicines")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public List<MedicineResponse> activeMedicines() {
        return medicineService.activeMedicines();
    }

    @GetMapping("/api/admin/medicines")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MedicineResponse> medicines() {
        return medicineService.medicines();
    }

    @PostMapping("/api/admin/medicines")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public MedicineResponse createMedicine(@Valid @RequestBody MedicineRequest request) {
        return medicineService.createMedicine(request);
    }

    @PutMapping("/api/admin/medicines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MedicineResponse updateMedicine(
            @PathVariable UUID id,
            @Valid @RequestBody MedicineRequest request
    ) {
        return medicineService.updateMedicine(id, request);
    }

    @DeleteMapping("/api/admin/medicines/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMedicine(@PathVariable UUID id) {
        medicineService.deleteMedicine(id);
    }
}

package com.hospital.backend.prescription;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    public PrescriptionResponse createPrescription(
            @Valid @RequestBody PrescriptionRequest request,
            Principal principal
    ) {
        return prescriptionService.createPrescription(request, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public PrescriptionResponse updatePrescription(
            @PathVariable UUID id,
            @Valid @RequestBody PrescriptionRequest request,
            Principal principal
    ) {
        return prescriptionService.updatePrescription(id, request, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('DOCTOR')")
    public void deletePrescription(
            @PathVariable UUID id,
            Principal principal
    ) {
        prescriptionService.deletePrescription(id, principal);
    }

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public List<PrescriptionResponse> myPatientPrescriptions(Principal principal) {
        return prescriptionService.myPatientPrescriptions(principal);
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<PrescriptionResponse> myDoctorPrescriptions(Principal principal) {
        return prescriptionService.myDoctorPrescriptions(principal);
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public PrescriptionResponse appointmentPrescription(
            @PathVariable UUID appointmentId,
            Principal principal
    ) {
        return prescriptionService.appointmentPrescription(appointmentId, principal);
    }
}

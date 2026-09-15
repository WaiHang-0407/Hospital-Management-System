package com.hospital.backend.prescription;

import com.hospital.backend.appointment.AppointmentRepository;
import com.hospital.backend.billing.BillingService;
import jakarta.transaction.Transactional;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingService billingService;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            AppointmentRepository appointmentRepository,
            BillingService billingService
    ) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.billingService = billingService;
    }

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request, Principal principal) {
        var appointment = appointmentRepository.findById(request.appointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (appointment.getDoctor() == null || !appointment.getDoctor().getUser().getEmail().equalsIgnoreCase(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only prescribe for your own appointments");
        }

        if ("CANCELLED".equalsIgnoreCase(appointment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancelled appointments cannot receive prescriptions");
        }

        if (prescriptionRepository.existsByAppointmentId(appointment.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment already has a prescription");
        }

        var prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setDoctor(appointment.getDoctor());
        prescription.setPatient(appointment.getPatient());
        prescription.setDiagnosis(request.diagnosis());
        prescription.setNotes(request.notes());
        prescription.setItems(request.items().stream().map(this::toItem).toList());

        var savedPrescription = prescriptionRepository.save(prescription);
        billingService.syncBillForPrescribedAppointment(appointment, savedPrescription.getItems());

        return toResponse(savedPrescription);
    }

    @Transactional
    public PrescriptionResponse updatePrescription(UUID id, PrescriptionRequest request, Principal principal) {
        var prescription = doctorOwnedPrescription(id, principal);

        if (!prescription.getAppointment().getId().equals(request.appointmentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prescription appointment cannot be changed");
        }

        prescription.setDiagnosis(request.diagnosis());
        prescription.setNotes(request.notes());
        prescription.setItems(request.items().stream().map(this::toItem).toList());
        billingService.syncBillForPrescribedAppointment(prescription.getAppointment(), prescription.getItems());

        return toResponse(prescription);
    }

    @Transactional
    public void deletePrescription(UUID id, Principal principal) {
        var prescription = doctorOwnedPrescription(id, principal);

        if ("COMPLETED".equalsIgnoreCase(prescription.getAppointment().getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed appointment prescriptions cannot be deleted");
        }

        billingService.deleteUnpaidBillForAppointment(prescription.getAppointment());
        prescriptionRepository.delete(prescription);
    }

    @Transactional
    public List<PrescriptionResponse> myPatientPrescriptions(Principal principal) {
        return prescriptionRepository.findByPatientUserEmailIgnoreCaseOrderByCreatedAtDesc(principal.getName())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<PrescriptionResponse> myDoctorPrescriptions(Principal principal) {
        return prescriptionRepository.findByDoctorUserEmailIgnoreCaseOrderByCreatedAtDesc(principal.getName())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PrescriptionResponse appointmentPrescription(UUID appointmentId, Principal principal) {
        var prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

        var email = principal.getName();
        var isDoctor = prescription.getDoctor().getUser().getEmail().equalsIgnoreCase(email);
        var isPatient = prescription.getPatient().getUser().getEmail().equalsIgnoreCase(email);

        if (!isDoctor && !isPatient) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view this prescription");
        }

        return toResponse(prescription);
    }

    private Prescription doctorOwnedPrescription(UUID id, Principal principal) {
        var prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

        if (!prescription.getDoctor().getUser().getEmail().equalsIgnoreCase(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own prescriptions");
        }

        return prescription;
    }

    private PrescriptionItem toItem(PrescriptionItemRequest request) {
        var item = new PrescriptionItem();
        item.setMedicineName(request.medicineName());
        item.setDosage(request.dosage());
        item.setFrequency(request.frequency());
        item.setDuration(request.duration());
        item.setInstructions(request.instructions());
        return item;
    }

    private PrescriptionResponse toResponse(Prescription prescription) {
        var appointment = prescription.getAppointment();
        return new PrescriptionResponse(
                prescription.getId(),
                appointment.getId(),
                prescription.getPatient().getUser().getFullName(),
                prescription.getDoctor().getUser().getFullName(),
                appointment.getDepartment(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                prescription.getDiagnosis(),
                prescription.getNotes(),
                prescription.getCreatedAt(),
                prescription.getItems().stream().map(this::toItemResponse).toList()
        );
    }

    private PrescriptionItemResponse toItemResponse(PrescriptionItem item) {
        return new PrescriptionItemResponse(
                item.getId(),
                item.getMedicineName(),
                item.getDosage(),
                item.getFrequency(),
                item.getDuration(),
                item.getInstructions()
        );
    }
}

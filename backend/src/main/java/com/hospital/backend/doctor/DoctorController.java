package com.hospital.backend.doctor;

import com.hospital.backend.appointment.AppointmentRepository;
import com.hospital.backend.patient.PatientRepository;
import com.hospital.backend.patient.PatientSummaryResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private static final Set<LocalTime> ALLOWED_APPOINTMENT_TIMES = Set.of(
            LocalTime.of(8, 0),
            LocalTime.of(9, 0),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            LocalTime.of(12, 0),
            LocalTime.of(13, 0),
            LocalTime.of(14, 0),
            LocalTime.of(15, 0),
            LocalTime.of(16, 0),
            LocalTime.of(17, 0),
            LocalTime.of(18, 0),
            LocalTime.of(19, 0)
    );

    private final DoctorRepository doctorRepository;
    private final DoctorUnavailabilityRepository unavailabilityRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorController(
            DoctorRepository doctorRepository,
            DoctorUnavailabilityRepository unavailabilityRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.unavailabilityRepository = unavailabilityRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'RECEPTIONIST')")
    public List<DoctorResponse> doctors(@RequestParam String department) {
        return doctorRepository
                .findBySpecializationIgnoreCaseAndUserEnabledTrueOrderByUserFullNameAsc(department)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private DoctorResponse toResponse(Doctor doctor) {
        var user = doctor.getUser();
        return new DoctorResponse(
                doctor.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                doctor.getSpecialization()
        );
    }

    @GetMapping("/{doctorId}/unavailability")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public List<DoctorUnavailabilityResponse> doctorUnavailability(
            @PathVariable UUID doctorId,
            @RequestParam LocalDate date
    ) {
        return unavailabilityRepository.findByDoctorIdAndUnavailableDateOrderByStartTimeAsc(doctorId, date).stream()
                .map(this::toUnavailabilityResponse)
                .toList();
    }

    @GetMapping("/{doctorId}/booked-slots")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public List<DoctorBookedSlotResponse> doctorBookedSlots(
            @PathVariable UUID doctorId,
            @RequestParam LocalDate date
    ) {
        return appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusOrderByAppointmentTimeAsc(doctorId, date, "PENDING").stream()
                .map(appointment -> new DoctorBookedSlotResponse(appointment.getAppointmentTime()))
                .toList();
    }

    @GetMapping("/me/unavailability")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<DoctorUnavailabilityResponse> myUnavailability(Principal principal) {
        var doctor = currentDoctor(principal);
        return unavailabilityRepository.findByDoctorIdOrderByUnavailableDateAscStartTimeAsc(doctor.getId()).stream()
                .map(this::toUnavailabilityResponse)
                .toList();
    }

    @PostMapping("/me/unavailability")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    public DoctorUnavailabilityResponse addUnavailability(
            @Valid @RequestBody DoctorUnavailabilityRequest request,
            Principal principal
    ) {
        var doctor = currentDoctor(principal);

        if (!ALLOWED_APPOINTMENT_TIMES.contains(request.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose one of the appointment slots");
        }

        if (unavailabilityRepository.existsByDoctorIdAndUnavailableDateAndStartTime(
                doctor.getId(),
                request.unavailableDate(),
                request.startTime()
        )) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This unavailable slot already exists");
        }

        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatus(
                doctor.getId(),
                request.unavailableDate(),
                request.startTime(),
                "PENDING"
        )) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot already has an appointment");
        }

        var unavailability = new DoctorUnavailability();
        unavailability.setDoctor(doctor);
        unavailability.setUnavailableDate(request.unavailableDate());
        unavailability.setStartTime(request.startTime());
        unavailability.setReason(request.reason());
        return toUnavailabilityResponse(unavailabilityRepository.save(unavailability));
    }

    @DeleteMapping("/me/unavailability/{id}")
    @Transactional
    @PreAuthorize("hasRole('DOCTOR')")
    public void deleteUnavailability(@PathVariable UUID id, Principal principal) {
        var doctor = currentDoctor(principal);
        unavailabilityRepository.deleteByIdAndDoctorId(id, doctor.getId());
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<PatientSummaryResponse> patients() {
        return patientRepository.findAllByUserEnabledTrueOrderByUserFullNameAsc().stream()
                .map(patient -> {
                    var user = patient.getUser();
                    return new PatientSummaryResponse(patient.getId(), user.getFullName(), user.getEmail(), user.getPhone());
                })
                .toList();
    }

    private Doctor currentDoctor(Principal principal) {
        return doctorRepository.findByUserEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor profile not found"));
    }

    private DoctorUnavailabilityResponse toUnavailabilityResponse(DoctorUnavailability unavailability) {
        return new DoctorUnavailabilityResponse(
                unavailability.getId(),
                unavailability.getDoctor().getId(),
                unavailability.getUnavailableDate(),
                unavailability.getStartTime(),
                unavailability.getReason()
        );
    }
}

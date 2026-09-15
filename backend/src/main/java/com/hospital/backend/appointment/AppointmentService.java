package com.hospital.backend.appointment;

import com.hospital.backend.doctor.Doctor;
import com.hospital.backend.doctor.DoctorRepository;
import com.hospital.backend.doctor.DoctorUnavailabilityRepository;
import com.hospital.backend.patient.PatientRepository;
import jakarta.transaction.Transactional;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AppointmentService {

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

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorUnavailabilityRepository unavailabilityRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DoctorUnavailabilityRepository unavailabilityRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.unavailabilityRepository = unavailabilityRepository;
    }

    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request, Principal principal) {
        validatePatientAppointmentTime(request);

        var patient = patientRepository.findByUserEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patients can book appointments"));

        var doctor = resolveDoctor(request.doctorId(), request.appointmentDate(), request.appointmentTime());

        var appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDepartment(request.department());
        appointment.setPreferredDoctor(doctor == null ? null : doctor.getUser().getFullName());
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setAppointmentTime(request.appointmentTime());
        appointment.setReason(request.reason());
        appointment.setNotes(request.notes());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse createDoctorAppointment(DoctorAppointmentRequest request, Principal principal) {
        validateStaffAppointmentTime(request.toAppointmentRequest());

        var doctor = doctorRepository.findByUserEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctors can create appointments"));

        ensureDoctorAvailable(doctor.getId(), request.appointmentDate(), request.appointmentTime());

        var patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        var appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDepartment(doctor.getSpecialization());
        appointment.setPreferredDoctor(doctor.getUser().getFullName());
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setAppointmentTime(request.appointmentTime());
        appointment.setReason(request.reason());
        appointment.setNotes(request.notes());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public List<AppointmentResponse> allAppointments() {
        var appointments = appointmentRepository.findAllByOrderByAppointmentDateDescAppointmentTimeDesc();
        completePastAppointments(appointments);
        return appointments
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<AppointmentResponse> myAppointments(Principal principal) {
        var appointments = appointmentRepository.findByPatientUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(principal.getName());
        completePastAppointments(appointments);
        return appointments
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<AppointmentResponse> myDoctorAppointments(Principal principal) {
        var appointments = appointmentRepository.findByDoctorUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(principal.getName());
        completePastAppointments(appointments);
        return appointments
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse completeDoctorAppointment(UUID appointmentId, Principal principal) {
        var appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (appointment.getDoctor() == null || !appointment.getDoctor().getUser().getEmail().equalsIgnoreCase(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only complete your own appointments");
        }

        appointment.setStatus("COMPLETED");
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(UUID appointmentId, RescheduleAppointmentRequest request, Principal principal) {
        var appointment = patientOwnedPendingAppointment(appointmentId, principal);
        validatePatientAppointmentTime(request.toAppointmentRequest(appointment));

        if (appointment.getDoctor() != null) {
            ensureDoctorAvailable(appointment.getDoctor().getId(), request.appointmentDate(), request.appointmentTime(), appointment.getId());
        }

        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setAppointmentTime(request.appointmentTime());
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(UUID appointmentId, Principal principal) {
        var appointment = patientOwnedPendingAppointment(appointmentId, principal);
        appointment.setStatus("CANCELLED");
        return toResponse(appointment);
    }

    private void validatePatientAppointmentTime(AppointmentRequest request) {
        validateAllowedAppointmentSlot(request.appointmentTime());

        if (request.appointmentDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointments must be booked at least 1 day before the visit date"
            );
        }
    }

    private void validateStaffAppointmentTime(AppointmentRequest request) {
        validateAllowedAppointmentSlot(request.appointmentTime());

        var requestedDateTime = LocalDateTime.of(request.appointmentDate(), request.appointmentTime());
        var earliestAllowed = LocalDateTime.now().plusHours(1);

        if (requestedDateTime.isBefore(earliestAllowed)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointments must be booked at least 1 hour from now"
            );
        }
    }

    private void validateAllowedAppointmentSlot(LocalTime appointmentTime) {
        if (!ALLOWED_APPOINTMENT_TIMES.contains(appointmentTime)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please choose one of the available appointment slots"
            );
        }
    }

    private Doctor resolveDoctor(UUID doctorId, java.time.LocalDate date, LocalTime time) {
        if (doctorId == null) {
            return null;
        }

        var doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected doctor was not found"));

        ensureDoctorAvailable(doctorId, date, time);
        return doctor;
    }

    private Appointment patientOwnedPendingAppointment(UUID appointmentId, Principal principal) {
        var appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (!appointment.getPatient().getUser().getEmail().equalsIgnoreCase(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own appointments");
        }

        if (!"PENDING".equalsIgnoreCase(appointment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending appointments can be changed");
        }

        return appointment;
    }

    private void completePastAppointments(List<Appointment> appointments) {
        var now = LocalDateTime.now();

        appointments.stream()
                .filter(appointment -> "PENDING".equalsIgnoreCase(appointment.getStatus()))
                .filter(appointment -> LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime()).plusHours(1).isBefore(now))
                .forEach(appointment -> appointment.setStatus("COMPLETED"));
    }

    private void ensureDoctorAvailable(UUID doctorId, java.time.LocalDate date, LocalTime time) {
        ensureDoctorAvailable(doctorId, date, time, null);
    }

    private void ensureDoctorAvailable(UUID doctorId, java.time.LocalDate date, LocalTime time, UUID excludedAppointmentId) {
        if (unavailabilityRepository.existsByDoctorIdAndUnavailableDateAndStartTime(doctorId, date, time)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected doctor is unavailable for this slot");
        }

        var isBooked = excludedAppointmentId == null
                ? appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatus(doctorId, date, time, "PENDING")
                : appointmentRepository.existsPendingDoctorSlotExcludingAppointment(doctorId, date, time, excludedAppointmentId);

        if (isBooked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected doctor is already booked for this slot");
        }
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        var patientUser = appointment.getPatient().getUser();
        return new AppointmentResponse(
                appointment.getId(),
                patientUser.getFullName(),
                patientUser.getPhone(),
                appointment.getDoctor() == null ? null : appointment.getDoctor().getId(),
                appointment.getDepartment(),
                appointment.getPreferredDoctor(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getStatus()
        );
    }
}

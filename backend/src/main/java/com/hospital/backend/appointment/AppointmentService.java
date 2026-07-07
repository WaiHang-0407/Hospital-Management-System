package com.hospital.backend.appointment;

import com.hospital.backend.doctor.Doctor;
import com.hospital.backend.doctor.DoctorRepository;
import com.hospital.backend.doctor.DoctorUnavailabilityRepository;
import com.hospital.backend.patient.PatientRepository;
import jakarta.transaction.Transactional;
import java.security.Principal;
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
            LocalTime.of(9, 0),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            LocalTime.of(12, 0),
            LocalTime.of(13, 0),
            LocalTime.of(14, 0),
            LocalTime.of(15, 0),
            LocalTime.of(16, 0),
            LocalTime.of(17, 0)
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
        validateAppointmentTime(request);

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
        appointment.setContactNumber(request.contactNumber());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse createDoctorAppointment(DoctorAppointmentRequest request, Principal principal) {
        validateAppointmentTime(request.toAppointmentRequest());

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
        appointment.setContactNumber(request.contactNumber());

        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> myAppointments(Principal principal) {
        return appointmentRepository
                .findByPatientUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(principal.getName())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AppointmentResponse> myDoctorAppointments(Principal principal) {
        return appointmentRepository
                .findByDoctorUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(principal.getName())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateAppointmentTime(AppointmentRequest request) {
        if (!ALLOWED_APPOINTMENT_TIMES.contains(request.appointmentTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please choose one of the available appointment slots"
            );
        }

        var requestedDateTime = LocalDateTime.of(request.appointmentDate(), request.appointmentTime());
        var earliestAllowed = LocalDateTime.now().plusHours(1);

        if (requestedDateTime.isBefore(earliestAllowed)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointments must be booked at least 1 hour from now"
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

    private void ensureDoctorAvailable(UUID doctorId, java.time.LocalDate date, LocalTime time) {
        if (unavailabilityRepository.existsByDoctorIdAndUnavailableDateAndStartTime(doctorId, date, time)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected doctor is unavailable for this slot");
        }

        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(doctorId, date, time)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected doctor is already booked for this slot");
        }
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getDepartment(),
                appointment.getPreferredDoctor(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getContactNumber(),
                appointment.getStatus()
        );
    }
}

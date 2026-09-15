package com.hospital.backend.appointment;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse bookAppointment(
            @Valid @RequestBody AppointmentRequest request,
            Principal principal
    ) {
        return appointmentService.bookAppointment(request, principal);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public List<AppointmentResponse> myAppointments(Principal principal) {
        return appointmentService.myAppointments(principal);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppointmentResponse> allAppointments() {
        return appointmentService.allAppointments();
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse rescheduleAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody RescheduleAppointmentRequest request,
            Principal principal
    ) {
        return appointmentService.rescheduleAppointment(id, request, principal);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse cancelAppointment(
            @PathVariable UUID id,
            Principal principal
    ) {
        return appointmentService.cancelAppointment(id, principal);
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<AppointmentResponse> myDoctorAppointments(Principal principal) {
        return appointmentService.myDoctorAppointments(principal);
    }

    @PostMapping("/doctor")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    public AppointmentResponse createDoctorAppointment(
            @Valid @RequestBody DoctorAppointmentRequest request,
            Principal principal
    ) {
        return appointmentService.createDoctorAppointment(request, principal);
    }

    @PatchMapping("/doctor/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public AppointmentResponse completeDoctorAppointment(
            @PathVariable UUID id,
            Principal principal
    ) {
        return appointmentService.completeDoctorAppointment(id, principal);
    }
}

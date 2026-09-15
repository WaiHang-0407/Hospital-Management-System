package com.hospital.backend.admin;

import com.hospital.backend.user.AppUser;
import com.hospital.backend.user.AppUserRepository;
import com.hospital.backend.user.Role;
import com.hospital.backend.user.RoleRepository;
import com.hospital.backend.appointment.Appointment;
import com.hospital.backend.appointment.AppointmentRepository;
import com.hospital.backend.appointment.AppointmentResponse;
import com.hospital.backend.billing.Bill;
import com.hospital.backend.billing.BillRepository;
import com.hospital.backend.billing.BillResponse;
import com.hospital.backend.billing.BillItem;
import com.hospital.backend.billing.BillItemResponse;
import com.hospital.backend.doctor.Doctor;
import com.hospital.backend.doctor.DoctorRepository;
import com.hospital.backend.patient.Patient;
import com.hospital.backend.patient.PatientRepository;
import com.hospital.backend.prescription.Prescription;
import com.hospital.backend.prescription.PrescriptionItem;
import com.hospital.backend.prescription.PrescriptionItemResponse;
import com.hospital.backend.prescription.PrescriptionRepository;
import com.hospital.backend.prescription.PrescriptionResponse;
import jakarta.persistence.criteria.JoinType;
import jakarta.transaction.Transactional;
import java.security.Principal;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {

    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final BillRepository billRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            AppUserRepository userRepository,
            RoleRepository roleRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            BillRepository billRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.billRepository = billRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<AdminUserResponse> findUsers(
            String search,
            String role,
            String status,
            String sort,
            String direction,
            int page,
            int size
    ) {
        var pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(sortDirection(direction), sortProperty(sort))
        );

        return userRepository.findAll(buildSpecification(search, role, status), pageable)
                .map(this::toResponse);
    }

    @Transactional
    public AdminUserDetailResponse userDetails(UUID id) {
        var user = findUser(id);
        var email = user.getEmail();
        var roleNames = user.getRoles().stream().map(Role::getName).toList();

        var appointments = roleNames.contains("DOCTOR")
                ? appointmentRepository.findByDoctorUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(email)
                : appointmentRepository.findByPatientUserEmailIgnoreCaseOrderByAppointmentDateAscAppointmentTimeAsc(email);

        var prescriptions = roleNames.contains("DOCTOR")
                ? prescriptionRepository.findByDoctorUserEmailIgnoreCaseOrderByCreatedAtDesc(email)
                : prescriptionRepository.findByPatientUserEmailIgnoreCaseOrderByCreatedAtDesc(email);

        var bills = roleNames.contains("PATIENT")
                ? billRepository.findByPatientUserEmailIgnoreCaseOrderByCreatedAtDesc(email)
                : java.util.List.<Bill>of();

        return new AdminUserDetailResponse(
                toResponse(user),
                appointments.stream().map(this::toAppointmentResponse).toList(),
                prescriptions.stream().map(this::toPrescriptionResponse).toList(),
                bills.stream().map(this::toBillResponse).toList()
        );
    }

    @Transactional
    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        var email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        var user = new AppUser();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        applyRole(user, request.role());
        var savedUser = userRepository.save(user);
        applyProfiles(savedUser, request.role(), request.doctorSpecialization());
        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse deactivateUser(UUID id, Principal principal) {
        var user = findUser(id);
        if (user.getEmail().equalsIgnoreCase(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own account");
        }

        user.setEnabled(false);
        return toResponse(user);
    }

    @Transactional
    public AdminUserResponse activateUser(UUID id) {
        var user = findUser(id);
        user.setEnabled(true);
        return toResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUser(UUID id, AdminUserUpdateRequest request, Principal principal) {
        var user = findUser(id);
        var roleName = normalizeRole(request.role());

        if (user.getEmail().equalsIgnoreCase(principal.getName()) && !"ADMIN".equals(roleName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove your own admin role");
        }

        applyRole(user, roleName);
        applyProfiles(user, roleName, request.doctorSpecialization());

        return toResponse(user);
    }

    private void applyRole(AppUser user, String requestedRole) {
        var roleName = normalizeRole(requestedRole);
        var role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role"));

        user.getRoles().clear();
        user.getRoles().add(role);
    }

    private void applyProfiles(AppUser user, String requestedRole, String doctorSpecialization) {
        var roleName = normalizeRole(requestedRole);
        if ("DOCTOR".equals(roleName)) {
            if (doctorSpecialization == null || doctorSpecialization.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor specialization is required");
            }

            var doctor = doctorRepository.findByUserId(user.getId()).orElseGet(Doctor::new);
            doctor.setUser(user);
            doctor.setSpecialization(doctorSpecialization.trim());
            doctorRepository.save(doctor);
        } else {
            doctorRepository.deleteByUserId(user.getId());
        }

        if ("PATIENT".equals(roleName) && !patientRepository.existsByUserId(user.getId())) {
            var patient = new Patient();
            patient.setUser(user);
            patientRepository.save(patient);
        }
    }

    private String normalizeRole(String role) {
        return role.trim().toUpperCase(Locale.ROOT);
    }

    private AppUser findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Specification<AppUser> buildSpecification(String search, String role, String status) {
        return (root, query, cb) -> {
            query.distinct(true);

            var predicate = cb.conjunction();

            if (search != null && !search.isBlank()) {
                var value = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("fullName")), value),
                        cb.like(cb.lower(root.get("email")), value),
                        cb.like(cb.lower(root.get("phone")), value)
                ));
            }

            if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
                var roles = root.join("roles", JoinType.INNER);
                predicate = cb.and(predicate, cb.equal(cb.upper(roles.get("name")), role.trim().toUpperCase(Locale.ROOT)));
            }

            if ("ACTIVE".equalsIgnoreCase(status)) {
                predicate = cb.and(predicate, cb.isTrue(root.get("enabled")));
            } else if ("INACTIVE".equalsIgnoreCase(status)) {
                predicate = cb.and(predicate, cb.isFalse(root.get("enabled")));
            }

            return predicate;
        };
    }

    private Sort.Direction sortDirection(String direction) {
        return "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private String sortProperty(String sort) {
        if ("fullName".equalsIgnoreCase(sort)) {
            return "fullName";
        }
        if ("email".equalsIgnoreCase(sort)) {
            return "email";
        }
        if ("enabled".equalsIgnoreCase(sort)) {
            return "enabled";
        }
        return "createdAt";
    }

    private AdminUserResponse toResponse(AppUser user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getRoles().stream()
                        .map(Role::getName)
                        .sorted()
                        .toList(),
                doctorRepository.findByUserId(user.getId())
                        .map(Doctor::getSpecialization)
                        .orElse(null)
        );
    }

    private AppointmentResponse toAppointmentResponse(Appointment appointment) {
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

    private PrescriptionResponse toPrescriptionResponse(Prescription prescription) {
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
                prescription.getItems().stream().map(this::toPrescriptionItemResponse).toList()
        );
    }

    private PrescriptionItemResponse toPrescriptionItemResponse(PrescriptionItem item) {
        return new PrescriptionItemResponse(
                item.getId(),
                item.getMedicineName(),
                item.getDosage(),
                item.getFrequency(),
                item.getDuration(),
                item.getInstructions()
        );
    }

    private BillResponse toBillResponse(Bill bill) {
        var appointment = bill.getAppointment();
        return new BillResponse(
                bill.getId(),
                appointment.getId(),
                bill.getPatient().getUser().getFullName(),
                appointment.getPreferredDoctor(),
                appointment.getDepartment(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                bill.getDescription(),
                bill.getAmount(),
                bill.getStatus(),
                bill.getPaidAt(),
                bill.getCreatedAt(),
                bill.getItems().stream().map(this::toBillItemResponse).toList()
        );
    }

    private BillItemResponse toBillItemResponse(BillItem item) {
        return new BillItemResponse(
                item.getId(),
                item.getItemName(),
                item.getItemType(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
        );
    }
}

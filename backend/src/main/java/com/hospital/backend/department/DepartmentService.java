package com.hospital.backend.department;

import com.hospital.backend.doctor.DoctorRepository;
import com.hospital.backend.user.AppUserRepository;
import com.hospital.backend.user.Role;
import jakarta.transaction.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMemberRepository memberRepository;
    private final AppUserRepository userRepository;
    private final DoctorRepository doctorRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            DepartmentMemberRepository memberRepository,
            AppUserRepository userRepository,
            DoctorRepository doctorRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<DepartmentResponse> departments() {
        return departmentRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        var name = request.name().trim();
        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department already exists");
        }

        var department = new Department();
        department.setName(name);
        department.setDescription(request.description());

        return toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse addMember(UUID departmentId, DepartmentMemberRequest request) {
        var department = findDepartment(departmentId);
        var user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!memberRepository.existsByDepartment_IdAndUser_Id(departmentId, request.userId())) {
            var member = new DepartmentMember();
            member.setDepartment(department);
            member.setUser(user);
            memberRepository.save(member);
        }

        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse removeMember(UUID departmentId, UUID userId) {
        var department = findDepartment(departmentId);
        memberRepository.deleteByDepartment_IdAndUser_Id(departmentId, userId);
        return toResponse(department);
    }

    private Department findDepartment(UUID departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
    }

    private DepartmentResponse toResponse(Department department) {
        Map<UUID, DepartmentMemberResponse> members = new LinkedHashMap<>();

        memberRepository.findByDepartment_IdOrderByUser_FullNameAsc(department.getId())
                .forEach(member -> {
                    var user = member.getUser();
                    members.put(user.getId(), toMemberResponse(user));
                });

        doctorRepository.findBySpecializationIgnoreCaseAndUserEnabledTrueOrderByUserFullNameAsc(department.getName())
                .forEach(doctor -> {
                    var user = doctor.getUser();
                    members.putIfAbsent(user.getId(), toMemberResponse(user));
                });

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription(),
                department.isActive(),
                members.values().stream().toList()
        );
    }

    private DepartmentMemberResponse toMemberResponse(com.hospital.backend.user.AppUser user) {
        return new DepartmentMemberResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRoles().stream().map(Role::getName).sorted().toList()
        );
    }
}

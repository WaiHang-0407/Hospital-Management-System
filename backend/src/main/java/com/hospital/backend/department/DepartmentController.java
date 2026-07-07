package com.hospital.backend.department;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/departments")
@PreAuthorize("hasRole('ADMIN')")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public List<DepartmentResponse> departments() {
        return departmentService.departments();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponse createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return departmentService.createDepartment(request);
    }

    @PostMapping("/{departmentId}/members")
    public DepartmentResponse addMember(
            @PathVariable UUID departmentId,
            @Valid @RequestBody DepartmentMemberRequest request
    ) {
        return departmentService.addMember(departmentId, request);
    }

    @DeleteMapping("/{departmentId}/members/{userId}")
    public DepartmentResponse removeMember(
            @PathVariable UUID departmentId,
            @PathVariable UUID userId
    ) {
        return departmentService.removeMember(departmentId, userId);
    }
}

package com.hospital.backend.department;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentMemberRepository extends JpaRepository<DepartmentMember, DepartmentMemberId> {

    List<DepartmentMember> findByDepartment_IdOrderByUser_FullNameAsc(UUID departmentId);

    boolean existsByDepartment_IdAndUser_Id(UUID departmentId, UUID userId);

    void deleteByDepartment_IdAndUser_Id(UUID departmentId, UUID userId);
}

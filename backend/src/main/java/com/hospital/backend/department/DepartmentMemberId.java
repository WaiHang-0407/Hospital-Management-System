package com.hospital.backend.department;

import java.io.Serializable;
import java.util.UUID;

public class DepartmentMemberId implements Serializable {

    private UUID department;
    private UUID user;
}

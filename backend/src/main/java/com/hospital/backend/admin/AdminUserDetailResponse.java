package com.hospital.backend.admin;

import com.hospital.backend.appointment.AppointmentResponse;
import com.hospital.backend.billing.BillResponse;
import com.hospital.backend.prescription.PrescriptionResponse;
import java.util.List;

public record AdminUserDetailResponse(
        AdminUserResponse user,
        List<AppointmentResponse> appointments,
        List<PrescriptionResponse> prescriptions,
        List<BillResponse> bills
) {
}

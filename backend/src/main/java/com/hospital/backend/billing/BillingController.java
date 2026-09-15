package com.hospital.backend.billing;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bills")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public List<BillResponse> myBills(Principal principal) {
        return billingService.myBills(principal);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BillResponse> allBills() {
        return billingService.allBills();
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasRole('PATIENT')")
    public BillResponse payBill(@PathVariable UUID id, Principal principal) {
        return billingService.payBill(id, principal);
    }
}

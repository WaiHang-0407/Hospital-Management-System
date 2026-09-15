package com.hospital.backend.billing;

import com.hospital.backend.appointment.Appointment;
import com.hospital.backend.medicine.MedicineRepository;
import com.hospital.backend.prescription.PrescriptionItem;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BillingService {

    private static final BigDecimal CONSULTATION_FEE = new BigDecimal("50.00");

    private final BillRepository billRepository;
    private final MedicineRepository medicineRepository;

    public BillingService(BillRepository billRepository, MedicineRepository medicineRepository) {
        this.billRepository = billRepository;
        this.medicineRepository = medicineRepository;
    }

    @Transactional
    public void syncBillForPrescribedAppointment(Appointment appointment, List<PrescriptionItem> prescriptionItems) {
        var existingBill = billRepository.findByAppointmentId(appointment.getId());

        if (existingBill.isPresent() && !"UNPAID".equalsIgnoreCase(existingBill.get().getStatus())) {
            return;
        }

        var bill = existingBill.orElseGet(() -> {
            var newBill = new Bill();
            newBill.setAppointment(appointment);
            newBill.setPatient(appointment.getPatient());
            newBill.setStatus("UNPAID");
            return newBill;
        });

        bill.setDescription("Consultation fee");
        bill.clearItems();
        bill.addItem(createBillItem("Consultation Fee", "CONSULTATION", 1, CONSULTATION_FEE));

        prescriptionItems.forEach((item) -> {
            var unitPrice = medicineRepository.findFirstByNameIgnoreCase(item.getMedicineName())
                    .map(medicine -> medicine.getPrice())
                    .orElse(BigDecimal.ZERO);
            bill.addItem(createBillItem(item.getMedicineName(), "MEDICINE", 1, unitPrice));
        });

        var total = bill.getItems()
                .stream()
                .map(BillItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        bill.setAmount(total);
        billRepository.save(bill);
    }

    public List<BillResponse> myBills(Principal principal) {
        return billRepository.findByPatientUserEmailIgnoreCaseOrderByCreatedAtDesc(principal.getName())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BillResponse> allBills() {
        return billRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteUnpaidBillForAppointment(Appointment appointment) {
        billRepository.findByAppointmentId(appointment.getId())
                .filter(bill -> "UNPAID".equalsIgnoreCase(bill.getStatus()))
                .ifPresent(billRepository::delete);
    }

    @Transactional
    public BillResponse payBill(UUID billId, Principal principal) {
        var bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));

        if (!bill.getPatient().getUser().getEmail().equalsIgnoreCase(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay your own bills");
        }

        if (!"UNPAID".equalsIgnoreCase(bill.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only unpaid bills can be paid");
        }

        bill.setStatus("PAID");
        bill.setPaidAt(OffsetDateTime.now());
        return toResponse(bill);
    }

    private BillResponse toResponse(Bill bill) {
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
                bill.getItems().stream().map(this::toItemResponse).toList()
        );
    }

    private BillItem createBillItem(String itemName, String itemType, int quantity, BigDecimal unitPrice) {
        var item = new BillItem();
        item.setItemName(itemName);
        item.setItemType(itemType);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        item.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        return item;
    }

    private BillItemResponse toItemResponse(BillItem item) {
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

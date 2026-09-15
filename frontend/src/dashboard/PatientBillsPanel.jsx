import { Fragment, useEffect, useMemo, useState } from 'react'
import { getMyBills, payBill } from '../api/billingApi'

function PatientBillsPanel({ token }) {
  const [bills, setBills] = useState([])
  const [expandedBillId, setExpandedBillId] = useState(null)
  const [receiptBill, setReceiptBill] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const unpaidTotal = useMemo(() => bills
    .filter((bill) => bill.status === 'UNPAID')
    .reduce((total, bill) => total + Number(bill.amount), 0), [bills])

  useEffect(() => {
    let ignore = false

    getMyBills(token)
      .then((data) => {
        if (!ignore) {
          setBills(data)
          setMessage('')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [token])

  async function paySelectedBill(id) {
    setMessage('')

    try {
      const paidBill = await payBill(token, id)
      setBills((current) => current.map((bill) => (
        bill.id === id ? paidBill : bill
      )))
      setReceiptBill(paidBill)
      setMessage('Payment completed.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <article className="panel bills-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h2>My Bills</h2>
        </div>
        <span className="role-pill">Unpaid: RM {unpaidTotal.toFixed(2)}</span>
      </div>

      {message && <p className="form-message neutral">{message}</p>}

      <div className="appointment-table-wrap">
        {bills.length === 0 ? (
          <p className="empty-note">{isLoading ? 'Loading bills...' : 'No bills available yet.'}</p>
        ) : (
          <table className="appointment-table bills-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <Fragment key={bill.id}>
                  <tr>
                    <td>{bill.appointmentDate}</td>
                    <td>{bill.doctorName || 'Not assigned'}</td>
                    <td>{bill.department}</td>
                    <td>{bill.description}</td>
                    <td>RM {Number(bill.amount).toFixed(2)}</td>
                    <td><span className="status-chip">{formatStatus(bill.status)}</span></td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => setExpandedBillId((current) => (current === bill.id ? null : bill.id))}
                        >
                          {expandedBillId === bill.id ? 'Hide Details' : 'Details'}
                        </button>
                        {bill.status === 'UNPAID' ? (
                          <button type="button" onClick={() => paySelectedBill(bill.id)}>
                            Pay
                          </button>
                        ) : (
                          <button type="button" onClick={() => setReceiptBill(bill)}>
                            View Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedBillId === bill.id && bill.items?.length > 0 && (
                    <tr>
                      <td colSpan="7">
                        <div className="bill-item-list">
                          {bill.items.map((item) => (
                            <div className="bill-item-row" key={item.id}>
                              <span>{item.itemName}</span>
                              <span>{formatStatus(item.itemType)}</span>
                              <span>Qty {item.quantity}</span>
                              <span>RM {Number(item.unitPrice).toFixed(2)} each</span>
                              <strong>RM {Number(item.totalPrice).toFixed(2)}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {receiptBill && (
        <div className="modal-backdrop" role="presentation">
          <section aria-modal="true" className="receipt-modal" role="dialog">
            <div className="receipt-header">
              <div>
                <p className="eyebrow">Receipt</p>
                <h2>Aurora Medical Centre</h2>
              </div>
              <button className="secondary-button" type="button" onClick={() => setReceiptBill(null)}>
                Close
              </button>
            </div>

            <div className="receipt-grid">
              <div>
                <span>Receipt ID</span>
                <strong>{receiptBill.id}</strong>
              </div>
              <div>
                <span>Paid At</span>
                <strong>{receiptBill.paidAt ? new Date(receiptBill.paidAt).toLocaleString() : '-'}</strong>
              </div>
              <div>
                <span>Patient</span>
                <strong>{receiptBill.patientName}</strong>
              </div>
              <div>
                <span>Appointment</span>
                <strong>{receiptBill.appointmentDate} {receiptBill.appointmentTime.slice(0, 5)}</strong>
              </div>
              <div>
                <span>Doctor</span>
                <strong>{receiptBill.doctorName || 'Not assigned'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{formatStatus(receiptBill.status)}</strong>
              </div>
            </div>

            <div className="bill-item-list">
              {receiptBill.items?.map((item) => (
                <div className="bill-item-row" key={item.id}>
                  <span>{item.itemName}</span>
                  <span>{formatStatus(item.itemType)}</span>
                  <span>Qty {item.quantity}</span>
                  <span>RM {Number(item.unitPrice).toFixed(2)} each</span>
                  <strong>RM {Number(item.totalPrice).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="receipt-total">
              <span>Total Paid</span>
              <strong>RM {Number(receiptBill.amount).toFixed(2)}</strong>
            </div>
          </section>
        </div>
      )}
    </article>
  )
}

function formatStatus(status) {
  return status
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

export default PatientBillsPanel

import { Fragment, useEffect, useMemo, useState } from 'react'
import { getAdminBills } from '../api/billingApi'

function AdminBillingPanel({ token }) {
  const [bills, setBills] = useState([])
  const [expandedBillId, setExpandedBillId] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const totals = useMemo(() => bills.reduce((summary, bill) => {
    const amount = Number(bill.amount)

    if (bill.status === 'PAID') {
      return { ...summary, paid: summary.paid + amount }
    }

    if (bill.status === 'UNPAID') {
      return { ...summary, unpaid: summary.unpaid + amount }
    }

    return summary
  }, { paid: 0, unpaid: 0 }), [bills])

  useEffect(() => {
    let ignore = false

    getAdminBills(token)
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

  return (
    <article className="panel bills-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Finance</p>
          <h2>Billing Information</h2>
        </div>
        <div className="table-actions">
          <span className="role-pill">Paid: RM {totals.paid.toFixed(2)}</span>
          <span className="role-pill">Unpaid: RM {totals.unpaid.toFixed(2)}</span>
        </div>
      </div>

      {message && <p className="form-message neutral">{message}</p>}

      <div className="appointment-table-wrap">
        {bills.length === 0 ? (
          <p className="empty-note">{isLoading ? 'Loading bills...' : 'No bills available yet.'}</p>
        ) : (
          <table className="appointment-table bills-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Appointment</th>
                <th>Department</th>
                <th>Description</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <Fragment key={bill.id}>
                  <tr>
                    <td>{bill.patientName}</td>
                    <td>{bill.doctorName || 'Not assigned'}</td>
                    <td>{bill.appointmentDate} {bill.appointmentTime.slice(0, 5)}</td>
                    <td>{bill.department}</td>
                    <td>{bill.description}</td>
                    <td>RM {Number(bill.amount).toFixed(2)}</td>
                    <td><span className="status-chip">{formatStatus(bill.status)}</span></td>
                    <td>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setExpandedBillId((current) => (current === bill.id ? null : bill.id))}
                      >
                        {expandedBillId === bill.id ? 'Hide Details' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedBillId === bill.id && bill.items?.length > 0 && (
                    <tr>
                      <td colSpan="8">
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
    </article>
  )
}

function formatStatus(status) {
  return status
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

export default AdminBillingPanel

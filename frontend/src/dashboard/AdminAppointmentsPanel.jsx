import { useEffect, useState } from 'react'
import { getAdminAppointments } from '../api/appointmentApi'

function AdminAppointmentsPanel({ token }) {
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    getAdminAppointments(token)
      .then((data) => {
        if (!ignore) {
          setAppointments(data)
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
    <article className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>All Appointment Details</h2>
        </div>
        <span className="role-pill">{appointments.length} records</span>
      </div>

      {message && <p className="form-message neutral">{message}</p>}

      <div className="appointment-table-wrap">
        {appointments.length === 0 ? (
          <p className="empty-note">{isLoading ? 'Loading appointments...' : 'No appointments found.'}</p>
        ) : (
          <table className="appointment-table admin-appointments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTime.slice(0, 5)}</td>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.patientPhone || '-'}</td>
                  <td>{appointment.preferredDoctor || 'Not assigned'}</td>
                  <td>{appointment.department}</td>
                  <td>{appointment.reason}</td>
                  <td><span className="status-chip">{formatStatus(appointment.status)}</span></td>
                </tr>
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

export default AdminAppointmentsPanel

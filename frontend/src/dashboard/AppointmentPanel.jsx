import { Fragment, useState } from 'react'

const appointmentSlots = [
  { value: '08:00', label: '8:00 AM - 9:00 AM' },
  { value: '09:00', label: '9:00 AM - 10:00 AM' },
  { value: '10:00', label: '10:00 AM - 11:00 AM' },
  { value: '11:00', label: '11:00 AM - 12:00 PM' },
  { value: '12:00', label: '12:00 PM - 1:00 PM' },
  { value: '13:00', label: '1:00 PM - 2:00 PM' },
  { value: '14:00', label: '2:00 PM - 3:00 PM' },
  { value: '15:00', label: '3:00 PM - 4:00 PM' },
  { value: '16:00', label: '4:00 PM - 5:00 PM' },
  { value: '17:00', label: '5:00 PM - 6:00 PM' },
  { value: '18:00', label: '6:00 PM - 7:00 PM' },
  { value: '19:00', label: '7:00 PM - 8:00 PM' },
]

function AppointmentPanel({
  appointments,
  emptyMessage = 'No appointments to display.',
  isPatient,
  onCancel,
  onReschedule,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ appointmentDate: '', appointmentTime: '' })
  const [filters, setFilters] = useState({ status: 'ALL', date: '', sort: 'LATEST' })
  const [message, setMessage] = useState('')
  const visibleAppointments = isPatient
    ? appointments
        .filter((appointment) => {
          const statusMatches = filters.status === 'ALL' || appointment.rawStatus === filters.status
          const dateMatches = !filters.date || appointment.date === filters.date

          return statusMatches && dateMatches
        })
        .sort((first, second) => comparePatientAppointments(first, second, filters.sort))
    : appointments

  function updateFilters(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function startReschedule(appointment) {
    setEditingId(appointment.id)
    setDraft({
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
    })
    setMessage('')
  }

  async function submitReschedule(event, appointmentId) {
    event.preventDefault()
    setMessage('')

    try {
      await onReschedule(appointmentId, draft)
      setEditingId(null)
      setDraft({ appointmentDate: '', appointmentTime: '' })
      setMessage('Appointment rescheduled.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function cancelSelectedAppointment(appointmentId) {
    setMessage('')

    try {
      await onCancel(appointmentId)
      setMessage('Appointment cancelled.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <article className="panel schedule-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{isPatient ? 'My Schedule' : 'Front Desk'}</p>
          <h2>{isPatient ? 'Upcoming Appointments' : "Today's Appointment Queue"}</h2>
        </div>
        <button className="secondary-button" type="button">View All</button>
      </div>

      {isPatient && (
        <div className="appointment-filter-row">
          <label>
            Status
            <select name="status" onChange={updateFilters} value={filters.status}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label>
            Date
            <input name="date" onChange={updateFilters} type="date" value={filters.date} />
          </label>
          <label>
            Sort
            <select name="sort" onChange={updateFilters} value={filters.sort}>
              <option value="LATEST">Latest first</option>
              <option value="OLDEST">Oldest first</option>
            </select>
          </label>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setFilters({ status: 'ALL', date: '', sort: 'LATEST' })}
          >
            Clear
          </button>
        </div>
      )}

      <div className="appointment-list">
        {visibleAppointments.length === 0 ? (
          <p className="empty-note">{emptyMessage}</p>
        ) : isPatient ? (
          <div className="appointment-table-wrap">
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleAppointments.map((appointment) => (
                  <Fragment key={appointment.id || `${appointment.date}-${appointment.time}-${appointment.patient}`}>
                    <tr>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.type}</td>
                      <td>{appointment.doctor}</td>
                      <td>{appointment.patient}</td>
                      <td><span className="status-chip">{appointment.status}</span></td>
                      <td>
                        {appointment.rawStatus === 'PENDING' ? (
                          <div className="table-actions">
                            <button className="secondary-button" type="button" onClick={() => startReschedule(appointment)}>
                              Reschedule
                            </button>
                            <button className="danger-button" type="button" onClick={() => cancelSelectedAppointment(appointment.id)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="empty-note">Locked</span>
                        )}
                      </td>
                    </tr>
                    {editingId === appointment.id && (
                      <tr>
                        <td colSpan="7">
                          <form className="reschedule-form" onSubmit={(event) => submitReschedule(event, appointment.id)}>
                            <label>
                              New Date
                              <input
                                min={getTomorrowDate()}
                                onChange={(event) => setDraft((current) => ({ ...current, appointmentDate: event.target.value }))}
                                required
                                type="date"
                                value={draft.appointmentDate}
                              />
                            </label>
                            <label>
                              New Time
                              <select
                                onChange={(event) => setDraft((current) => ({ ...current, appointmentTime: event.target.value }))}
                                required
                                value={draft.appointmentTime}
                              >
                                <option value="">Select time</option>
                                {appointmentSlots.map((slot) => (
                                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                                ))}
                              </select>
                            </label>
                            <button type="submit">Save</button>
                            <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>
                              Close
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          visibleAppointments.map((appointment) => (
            <div className="appointment-row" key={appointment.id || `${appointment.time}-${appointment.patient}`}>
              <time>{appointment.time}</time>
              <div>
                <strong>{appointment.patient}</strong>
                <span>{appointment.type} with {appointment.doctor}</span>
              </div>
              <span className="status-chip">{appointment.status}</span>
            </div>
          ))
        )}
      </div>
      {message && <p className="form-message neutral">{message}</p>}
    </article>
  )
}

function getTomorrowDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function comparePatientAppointments(first, second, sortOrder) {
  const firstTime = new Date(`${first.date}T${first.time}`).getTime()
  const secondTime = new Date(`${second.date}T${second.time}`).getTime()

  return sortOrder === 'LATEST' ? secondTime - firstTime : firstTime - secondTime
}

export default AppointmentPanel

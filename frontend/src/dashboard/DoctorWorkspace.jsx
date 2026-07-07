import { useEffect, useState } from 'react'
import { createDoctorAppointment, getMyDoctorAppointments } from '../api/appointmentApi'
import {
  addMyUnavailability,
  deleteMyUnavailability,
  getDoctorPatients,
  getMyUnavailability,
} from '../api/doctorApi'

const appointmentSlots = [
  { value: '09:00', label: '9:00 AM - 10:00 AM' },
  { value: '10:00', label: '10:00 AM - 11:00 AM' },
  { value: '11:00', label: '11:00 AM - 12:00 PM' },
  { value: '12:00', label: '12:00 PM - 1:00 PM' },
  { value: '13:00', label: '1:00 PM - 2:00 PM' },
  { value: '14:00', label: '2:00 PM - 3:00 PM' },
  { value: '15:00', label: '3:00 PM - 4:00 PM' },
  { value: '16:00', label: '4:00 PM - 5:00 PM' },
  { value: '17:00', label: '5:00 PM - 6:00 PM' },
]

const initialUnavailabilityForm = {
  startTime: '',
  reason: '',
}

const initialAppointmentForm = {
  patientId: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
  contactNumber: '',
  notes: '',
}

function DoctorWorkspace({ token, activePage = 'dashboard' }) {
  const [unavailability, setUnavailability] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [availabilityDate, setAvailabilityDate] = useState(getTodayDate())
  const [unavailabilityForm, setUnavailabilityForm] = useState(initialUnavailabilityForm)
  const [appointmentForm, setAppointmentForm] = useState(initialAppointmentForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let ignore = false

    Promise.all([getMyUnavailability(token), getDoctorPatients(token), getMyDoctorAppointments(token)])
      .then(([unavailabilityData, patientData, appointmentData]) => {
        if (!ignore) {
          setUnavailability(unavailabilityData)
          setPatients(patientData)
          setAppointments(appointmentData)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.message)
        }
      })

    return () => {
      ignore = true
    }
  }, [token])

  function updateUnavailabilityForm(event) {
    const { name, value } = event.target
    setUnavailabilityForm((current) => ({ ...current, [name]: value }))
  }

  function updateAppointmentForm(event) {
    const { name, value } = event.target
    setAppointmentForm((current) => ({ ...current, [name]: value }))
  }

  async function submitUnavailability(event) {
    event.preventDefault()
    await blockSlot(unavailabilityForm.startTime, unavailabilityForm.reason)
  }

  async function blockSlot(startTime, reason = '') {
    setMessage('')

    try {
      const slot = await addMyUnavailability(token, {
        unavailableDate: availabilityDate,
        startTime,
        reason,
      })
      setUnavailability((current) => [...current, slot])
      setUnavailabilityForm(initialUnavailabilityForm)
      setMessage('Unavailable slot blocked.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function removeUnavailability(id) {
    setMessage('')

    try {
      await deleteMyUnavailability(token, id)
      setUnavailability((current) => current.filter((slot) => slot.id !== id))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function submitAppointment(event) {
    event.preventDefault()
    setMessage('')

    try {
      const appointment = await createDoctorAppointment(token, appointmentForm)
      setAppointments((current) => [...current, appointment])
      setAppointmentForm(initialAppointmentForm)
      setMessage('Appointment created.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (activePage === 'appointments') {
    return (
      <section className="doctor-workspace">
        {renderIncomingAppointmentsPanel()}
        {renderAppointmentPanel()}
      </section>
    )
  }

  if (activePage === 'patients') {
    return (
      <section className="doctor-workspace doctor-workspace-single">
        {renderPatientsPanel()}
      </section>
    )
  }

  return (
    <section className="doctor-workspace doctor-workspace-single">
      {renderAvailabilityPanel()}
    </section>
  )

  function renderAvailabilityPanel() {
    const slotRows = getSlotRows(availabilityDate, unavailability, appointments)
    const blockableSlots = slotRows.filter((slot) => slot.status === 'available')

    return (
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Availability</p>
            <h2>Block Unavailable Slots</h2>
          </div>
        </div>

        <div className="availability-toolbar">
          <label>
            Date
            <input
              min={getTodayDate()}
              onChange={(event) => {
                setAvailabilityDate(event.target.value)
                setUnavailabilityForm(initialUnavailabilityForm)
              }}
              type="date"
              value={availabilityDate}
            />
          </label>

          <form className="availability-block-form" onSubmit={submitUnavailability}>
            <label>
              Slot
              <select
                name="startTime"
                onChange={updateUnavailabilityForm}
                required
                value={unavailabilityForm.startTime}
              >
                <option value="">Select slot</option>
                {blockableSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </label>

            <label>
              Reason
              <input
                name="reason"
                onChange={updateUnavailabilityForm}
                placeholder="Surgery, meeting, leave..."
                value={unavailabilityForm.reason}
              />
            </label>

            <button type="submit">Block Slot</button>
          </form>
        </div>

        <div className="availability-legend">
          <span><i className="availability-dot available" /> Available</span>
          <span><i className="availability-dot unavailable" /> Unavailable</span>
          <span><i className="availability-dot booked" /> Booked</span>
        </div>

        <div className="availability-table">
          <div className="availability-table-head">
            <span>Time</span>
            <span>Status</span>
            <span>Details</span>
            <span>Action</span>
          </div>

          {slotRows.map((slot) => (
            <div className={`availability-table-row ${slot.status}`} key={slot.value}>
              <strong>{slot.label}</strong>
              <span className="availability-status">{getStatusLabel(slot.status)}</span>
              <span>{slot.detail}</span>
              <span>
                {slot.status === 'available' && (
                  <button className="secondary-button" type="button" onClick={() => blockSlot(slot.value)}>
                    Block
                  </button>
                )}
                {slot.status === 'unavailable' && (
                  <button className="secondary-button" type="button" onClick={() => removeUnavailability(slot.unavailabilityId)}>
                    Remove Block
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        {message && <p className="form-message neutral">{message}</p>}
      </article>
    )
  }

  function renderAppointmentPanel() {
    return (
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Appointments</p>
            <h2>Create Patient Appointment</h2>
          </div>
        </div>

        <form className="booking-form" onSubmit={submitAppointment}>
          <label>
            Patient
            <select
              name="patientId"
              onChange={updateAppointmentForm}
              required
              value={appointmentForm.patientId}
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.fullName} ({patient.email})
                </option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <label>
              Date
              <input
                min={getTodayDate()}
                name="appointmentDate"
                onChange={updateAppointmentForm}
                required
                type="date"
                value={appointmentForm.appointmentDate}
              />
            </label>

            <label>
              Slot
              <select
                name="appointmentTime"
                onChange={updateAppointmentForm}
                required
                value={appointmentForm.appointmentTime}
              >
                <option value="">Select slot</option>
                {getBookableSlots(appointmentForm.appointmentDate, unavailability, appointments)
                  .map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label>
            Reason
            <input name="reason" onChange={updateAppointmentForm} required value={appointmentForm.reason} />
          </label>

          <label>
            Contact Number
            <input name="contactNumber" onChange={updateAppointmentForm} value={appointmentForm.contactNumber} />
          </label>

          <label>
            Notes
            <textarea name="notes" onChange={updateAppointmentForm} rows="3" value={appointmentForm.notes} />
          </label>

          {message && <p className="form-message neutral">{message}</p>}

          <button type="submit">Create Appointment</button>
        </form>
      </article>
    )
  }

  function renderIncomingAppointmentsPanel() {
    const incomingAppointments = [...appointments]
      .filter((appointment) => isIncomingAppointment(appointment.appointmentDate, appointment.appointmentTime))
      .sort(compareAppointments)

    return (
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Incoming</p>
            <h2>Upcoming Appointments</h2>
          </div>
        </div>

        <div className="appointment-list">
          {incomingAppointments.length === 0 ? (
            <p className="empty-note">No incoming appointments.</p>
          ) : (
            incomingAppointments.map((appointment) => (
              <div className="appointment-row" key={appointment.id}>
                <time>{formatAppointmentTime(appointment)}</time>
                <div>
                  <strong>{appointment.reason}</strong>
                  <span>{appointment.department}</span>
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

  function renderPatientsPanel() {
    return (
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Patients</p>
            <h2>Patient Directory</h2>
          </div>
        </div>

        <div className="member-list">
          {patients.map((patient) => (
            <div className="member-row" key={patient.patientId}>
              <div>
                <strong>{patient.fullName}</strong>
                <span>{patient.email}</span>
                {patient.phone && <small>{patient.phone}</small>}
              </div>
            </div>
          ))}
        </div>

        {message && <p className="form-message neutral">{message}</p>}
      </article>
    )
  }
}

function getSlotRows(date, unavailability, appointments) {
  const unavailableByTime = new Map(
    unavailability
      .filter((slot) => slot.unavailableDate === date)
      .map((slot) => [slot.startTime.slice(0, 5), slot]),
  )
  const bookedByTime = new Map(
    appointments
      .filter((appointment) => appointment.appointmentDate === date)
      .map((appointment) => [appointment.appointmentTime.slice(0, 5), appointment]),
  )

  return appointmentSlots.map((slot) => {
    const bookedAppointment = bookedByTime.get(slot.value)
    const unavailableSlot = unavailableByTime.get(slot.value)

    if (bookedAppointment) {
      return {
        ...slot,
        status: 'booked',
        detail: bookedAppointment.reason || 'Booked appointment',
      }
    }

    if (unavailableSlot) {
      return {
        ...slot,
        status: 'unavailable',
        detail: unavailableSlot.reason || 'Blocked by doctor',
        unavailabilityId: unavailableSlot.id,
      }
    }

    return {
      ...slot,
      status: 'available',
      detail: 'Open for appointments',
    }
  })
}

function getBookableSlots(date, unavailability, appointments) {
  if (!date) {
    return appointmentSlots
  }

  return getSlotRows(date, unavailability, appointments)
    .filter((slot) => slot.status === 'available')
}

function getStatusLabel(status) {
  if (status === 'booked') {
    return 'Booked'
  }

  if (status === 'unavailable') {
    return 'Unavailable'
  }

  return 'Available'
}

function isIncomingAppointment(date, time) {
  return new Date(`${date}T${time}`) >= new Date()
}

function compareAppointments(first, second) {
  return new Date(`${first.appointmentDate}T${first.appointmentTime}`)
    - new Date(`${second.appointmentDate}T${second.appointmentTime}`)
}

function formatAppointmentTime(appointment) {
  return `${appointment.appointmentDate} ${appointment.appointmentTime.slice(0, 5)}`
}

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default DoctorWorkspace

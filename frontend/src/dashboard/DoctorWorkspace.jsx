import { Fragment, useEffect, useState } from 'react'
import { completeDoctorAppointment, createDoctorAppointment, getMyDoctorAppointments } from '../api/appointmentApi'
import {
  addMyUnavailability,
  deleteMyUnavailability,
  getDoctorPatients,
  getMyUnavailability,
} from '../api/doctorApi'
import { getAvailableMedicines } from '../api/medicineApi'
import {
  createPrescription,
  deletePrescription,
  getMyDoctorPrescriptions,
  updatePrescription,
} from '../api/prescriptionApi'

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

const initialUnavailabilityForm = {
  startTime: '',
  reason: '',
}

const initialAppointmentForm = {
  patientId: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
  notes: '',
}

const initialPrescriptionForm = {
  id: '',
  appointmentId: '',
  diagnosis: '',
  notes: '',
  items: [
    {
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    },
  ],
}

function DoctorWorkspace({ token, activePage = 'dashboard' }) {
  const [unavailability, setUnavailability] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [medicines, setMedicines] = useState([])
  const [availabilityDate, setAvailabilityDate] = useState(getTodayDate())
  const [unavailabilityForm, setUnavailabilityForm] = useState(initialUnavailabilityForm)
  const [appointmentForm, setAppointmentForm] = useState(initialAppointmentForm)
  const [appointmentFilters, setAppointmentFilters] = useState({ status: 'ALL', date: '', sort: 'LATEST' })
  const [prescriptionForm, setPrescriptionForm] = useState(initialPrescriptionForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let ignore = false

    Promise.all([
      getMyUnavailability(token),
      getDoctorPatients(token),
      getMyDoctorAppointments(token),
      getMyDoctorPrescriptions(token),
      getAvailableMedicines(token),
    ])
      .then(([unavailabilityData, patientData, appointmentData, prescriptionData, medicineData]) => {
        if (!ignore) {
          setUnavailability(unavailabilityData)
          setPatients(patientData)
          setAppointments(appointmentData)
          setPrescriptions(prescriptionData)
          setMedicines(medicineData)
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

  function updateAppointmentFilters(event) {
    const { name, value } = event.target
    setAppointmentFilters((current) => ({ ...current, [name]: value }))
  }

  function startPrescription(appointment) {
    setPrescriptionForm({
      ...initialPrescriptionForm,
      appointmentId: appointment.id,
    })
    setMessage('')
  }

  function startEditPrescription(prescription) {
    setPrescriptionForm({
      id: prescription.id,
      appointmentId: prescription.appointmentId,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes || '',
      items: prescription.items.map((item) => ({
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || '',
      })),
    })
    setMessage('')
  }

  function updatePrescriptionForm(event) {
    const { name, value } = event.target
    setPrescriptionForm((current) => ({ ...current, [name]: value }))
  }

  function updatePrescriptionItem(index, event) {
    const { name, value } = event.target
    setPrescriptionForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [name]: value } : item
      )),
    }))
  }

  function addPrescriptionItem() {
    setPrescriptionForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          medicineName: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    }))
  }

  function removePrescriptionItem(index) {
    setPrescriptionForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
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

  async function markAppointmentCompleted(id) {
    setMessage('')

    try {
      const completedAppointment = await completeDoctorAppointment(token, id)
      setAppointments((current) => current.map((appointment) => (
        appointment.id === id ? completedAppointment : appointment
      )))
      setMessage('Appointment marked as completed.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function submitPrescription(event) {
    event.preventDefault()
    setMessage('')

    try {
      const prescription = prescriptionForm.id
        ? await updatePrescription(token, prescriptionForm.id, prescriptionPayload(prescriptionForm))
        : await createPrescription(token, prescriptionPayload(prescriptionForm))

      setPrescriptions((current) => {
        if (prescriptionForm.id) {
          return current.map((item) => (item.id === prescription.id ? prescription : item))
        }

        return [prescription, ...current]
      })
      setPrescriptionForm(initialPrescriptionForm)
      setMessage(prescriptionForm.id ? 'Prescription updated.' : 'Prescription saved.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function removePrescription(id) {
    setMessage('')

    try {
      await deletePrescription(token, id)
      setPrescriptions((current) => current.filter((prescription) => prescription.id !== id))
      if (prescriptionForm.id === id) {
        setPrescriptionForm(initialPrescriptionForm)
      }
      setMessage('Prescription deleted.')
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
      <article className="panel doctor-appointment-create-panel">
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
    const prescriptionsByAppointmentId = new Map(
      prescriptions.map((prescription) => [prescription.appointmentId, prescription]),
    )
    const visibleAppointments = appointments
      .filter((appointment) => {
        const statusMatches = appointmentFilters.status === 'ALL' || appointment.status === appointmentFilters.status
        const dateMatches = !appointmentFilters.date || appointment.appointmentDate === appointmentFilters.date

        return statusMatches && dateMatches
      })
      .sort((first, second) => compareAppointments(first, second, appointmentFilters.sort))

    return (
      <article className="panel doctor-schedule-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Schedule</p>
            <h2>Appointments</h2>
          </div>
        </div>

        <div className="appointment-filter-row">
          <label>
            Status
            <select name="status" onChange={updateAppointmentFilters} value={appointmentFilters.status}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label>
            Date
            <input
              name="date"
              onChange={updateAppointmentFilters}
              type="date"
              value={appointmentFilters.date}
            />
          </label>
          <label>
            Sort
            <select name="sort" onChange={updateAppointmentFilters} value={appointmentFilters.sort}>
              <option value="LATEST">Latest first</option>
              <option value="OLDEST">Oldest first</option>
            </select>
          </label>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setAppointmentFilters({ status: 'ALL', date: '', sort: 'LATEST' })}
          >
            Clear
          </button>
        </div>

        <div className="appointment-table-wrap">
          {visibleAppointments.length === 0 ? (
            <p className="empty-note">No appointments.</p>
          ) : (
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleAppointments.map((appointment) => (
                  <Fragment key={appointment.id}>
                    <tr>
                      <td>{appointment.appointmentDate}</td>
                      <td>{appointment.appointmentTime.slice(0, 5)}</td>
                      <td>{appointment.patientName}</td>
                      <td>{appointment.patientPhone || 'Not provided'}</td>
                      <td>{appointment.reason}</td>
                      <td><span className="status-chip">{formatStatus(appointment.status)}</span></td>
                      <td>
                        <div className="table-actions">
                          {appointment.status === 'PENDING' ? (
                            <button
                              className="secondary-button"
                              type="button"
                              onClick={() => markAppointmentCompleted(appointment.id)}
                            >
                              Complete
                            </button>
                          ) : (
                            <span className="empty-note">Done</span>
                          )}
                          {appointment.status !== 'CANCELLED' && !prescriptionsByAppointmentId.has(appointment.id) && (
                            <button
                              className="secondary-button"
                              type="button"
                              onClick={() => startPrescription(appointment)}
                            >
                              Prescribe
                            </button>
                          )}
                          {prescriptionsByAppointmentId.has(appointment.id) && (
                            <>
                              <button
                                className="secondary-button"
                                type="button"
                                onClick={() => startEditPrescription(prescriptionsByAppointmentId.get(appointment.id))}
                              >
                                Edit Prescription
                              </button>
                              {appointment.status !== 'COMPLETED' && (
                                <button
                                  className="danger-button"
                                  type="button"
                                  onClick={() => removePrescription(prescriptionsByAppointmentId.get(appointment.id).id)}
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {prescriptionForm.appointmentId === appointment.id && (
                      <tr>
                        <td colSpan="7">
                          {renderPrescriptionForm(appointment)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {message && <p className="form-message neutral">{message}</p>}
      </article>
    )
  }

  function renderPrescriptionForm(appointment) {
    return (
      <form className="prescription-form" onSubmit={submitPrescription}>
        <div className="prescription-form-header">
          <div>
            <strong>Prescription for {appointment.patientName}</strong>
            <span>{appointment.appointmentDate} at {appointment.appointmentTime.slice(0, 5)}</span>
          </div>
          <button className="secondary-button" type="button" onClick={() => setPrescriptionForm(initialPrescriptionForm)}>
            Close
          </button>
        </div>

        <label>
          Diagnosis
          <input
            name="diagnosis"
            onChange={updatePrescriptionForm}
            required
            value={prescriptionForm.diagnosis}
          />
        </label>

        <label>
          Notes
          <textarea
            name="notes"
            onChange={updatePrescriptionForm}
            rows="2"
            value={prescriptionForm.notes}
          />
        </label>

        <div className="prescription-items">
          {prescriptionForm.items.map((item, index) => (
            <div className="prescription-item-row" key={`medicine-${index}`}>
              <label>
                Medicine
                <select
                  name="medicineName"
                  onChange={(event) => updatePrescriptionItem(index, event)}
                  required
                  value={item.medicineName}
                >
                  <option value="">Select medicine</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.name}>
                      {formatMedicineOption(medicine)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dosage
                <input
                  name="dosage"
                  onChange={(event) => updatePrescriptionItem(index, event)}
                  placeholder="500mg"
                  required
                  value={item.dosage}
                />
              </label>
              <label>
                Frequency
                <input
                  name="frequency"
                  onChange={(event) => updatePrescriptionItem(index, event)}
                  placeholder="3 times daily"
                  required
                  value={item.frequency}
                />
              </label>
              <label>
                Duration
                <input
                  name="duration"
                  onChange={(event) => updatePrescriptionItem(index, event)}
                  placeholder="5 days"
                  required
                  value={item.duration}
                />
              </label>
              <label>
                Instructions
                <input
                  name="instructions"
                  onChange={(event) => updatePrescriptionItem(index, event)}
                  placeholder="After meals"
                  value={item.instructions}
                />
              </label>
              {prescriptionForm.items.length > 1 && (
                <button className="secondary-button" type="button" onClick={() => removePrescriptionItem(index)}>
                  Remove
                </button>
                      )}
            </div>
          ))}
        </div>

        <div className="table-actions">
          <button className="secondary-button" type="button" onClick={addPrescriptionItem}>
            Add Medicine
          </button>
          <button type="submit">
            {prescriptionForm.id ? 'Update Prescription' : 'Save Prescription'}
          </button>
        </div>
      </form>
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

function compareAppointments(first, second, sortOrder = 'LATEST') {
  const firstTime = new Date(`${first.appointmentDate}T${first.appointmentTime}`).getTime()
  const secondTime = new Date(`${second.appointmentDate}T${second.appointmentTime}`).getTime()

  return sortOrder === 'LATEST' ? secondTime - firstTime : firstTime - secondTime
}

function formatStatus(status) {
  if (!status) {
    return 'Pending'
  }

  return status
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatMedicineOption(medicine) {
  const details = [
    medicine.strength,
    medicine.unit,
    `RM ${Number(medicine.price || 0).toFixed(2)}`,
    `${medicine.stockQuantity} in stock`,
  ]
    .filter(Boolean)
    .join(' - ')

  return details ? `${medicine.name} (${details})` : medicine.name
}

function prescriptionPayload(form) {
  return {
    appointmentId: form.appointmentId,
    diagnosis: form.diagnosis,
    notes: form.notes,
    items: form.items,
  }
}

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default DoctorWorkspace

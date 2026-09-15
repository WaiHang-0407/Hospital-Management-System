import { useEffect, useState } from 'react'
import { bookAppointment } from '../api/appointmentApi'
import { getDoctorBookedSlots, getDoctorUnavailability, getDoctorsByDepartment } from '../api/doctorApi'

const initialForm = {
  department: '',
  doctorId: '',
  preferredDoctor: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
  notes: '',
}

const departments = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Emergency',
]

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

function AppointmentBookingForm({ token, onBooked }) {
  const [form, setForm] = useState(initialForm)
  const [doctors, setDoctors] = useState([])
  const [doctorUnavailability, setDoctorUnavailability] = useState([])
  const [doctorBookedSlots, setDoctorBookedSlots] = useState([])
  const [message, setMessage] = useState('')
  const [confirmedAppointment, setConfirmedAppointment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)

  useEffect(() => {
    if (!form.department) {
      return
    }

    let ignore = false

    getDoctorsByDepartment(token, form.department)
      .then((data) => {
        if (!ignore) {
          setDoctors(data)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setDoctors([])
          setMessage(error.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingDoctors(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [form.department, token])

  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) {
      return
    }

    let ignore = false

    Promise.all([
      getDoctorUnavailability(token, form.doctorId, form.appointmentDate),
      getDoctorBookedSlots(token, form.doctorId, form.appointmentDate),
    ])
      .then(([unavailabilityData, bookedSlotData]) => {
        if (!ignore) {
          setDoctorUnavailability(unavailabilityData)
          setDoctorBookedSlots(bookedSlotData)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setDoctorUnavailability([])
          setDoctorBookedSlots([])
          setMessage(error.message)
        }
      })

    return () => {
      ignore = true
    }
  }, [form.doctorId, form.appointmentDate, token])

  function updateForm(event) {
    const { name, value } = event.target
    if (name === 'department') {
      setDoctors([])
      setDoctorUnavailability([])
      setDoctorBookedSlots([])
      setIsLoadingDoctors(Boolean(value))
    }

    if (name === 'appointmentDate') {
      setDoctorUnavailability([])
      setDoctorBookedSlots([])
    }

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'department' ? { doctorId: '', preferredDoctor: '' } : {}),
      ...(name === 'appointmentDate' ? { appointmentTime: '' } : {}),
    }))
  }

  async function submitForm(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    if (!isAppointmentDateAllowed(form.appointmentDate)) {
      setMessage('Appointments must be booked at least 1 day before the visit date.')
      setIsSubmitting(false)
      return
    }

    try {
      const appointment = await bookAppointment(token, form)
      setForm(initialForm)
      setMessage('Appointment request submitted.')
      setConfirmedAppointment(appointment)
      onBooked(appointment)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article className="panel booking-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Appointment</p>
          <h2>Book a Visit</h2>
        </div>
      </div>

      <form className="booking-form" onSubmit={submitForm}>
        <div className="form-grid">
          <label>
            Department
            <select
              name="department"
              onChange={updateForm}
              required
              value={form.department}
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label>
            Doctor
            <select
              name="preferredDoctor"
              onChange={(event) => {
                const selectedDoctor = doctors.find((doctor) => doctor.id === event.target.value)
                setForm((current) => ({
                  ...current,
                  doctorId: event.target.value,
                  preferredDoctor: selectedDoctor?.fullName || '',
                  appointmentTime: '',
                }))
                setDoctorUnavailability([])
                setDoctorBookedSlots([])
              }}
              value={form.doctorId}
              disabled={!form.department || isLoadingDoctors}
            >
              <option value="">
                {isLoadingDoctors ? 'Loading doctors...' : 'Any available doctor'}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              min={getTomorrowDate()}
              name="appointmentDate"
              onChange={updateForm}
              required
              type="date"
              value={form.appointmentDate}
            />
          </label>

          <label>
            Time Slot
            <select
              name="appointmentTime"
              onChange={updateForm}
              required
              value={form.appointmentTime}
              disabled={!form.appointmentDate}
            >
              <option value="">Select time slot</option>
              {getAvailableSlots(form.appointmentDate, form.doctorId, doctorUnavailability, doctorBookedSlots).map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Reason for Visit
          <input
            name="reason"
            onChange={updateForm}
            placeholder="Fever, checkup, follow-up..."
            required
            value={form.reason}
          />
        </label>

        <label>
          Notes
          <textarea
            name="notes"
            onChange={updateForm}
            placeholder="Optional details for the care team"
            rows="3"
            value={form.notes}
          />
        </label>

        {message && <p className="form-message neutral">{message}</p>}

        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Submitting...' : 'Request Appointment'}
        </button>
      </form>

      {confirmedAppointment && (
        <AppointmentConfirmation appointment={confirmedAppointment} />
      )}
    </article>
  )
}

function AppointmentConfirmation({ appointment }) {
  return (
    <section className="appointment-confirmation">
      <div className="appointment-confirmation-header">
        <div>
          <p className="eyebrow">Confirmed Request</p>
          <h3>Appointment Details</h3>
        </div>
        <span className="status-chip">{formatStatus(appointment.status)}</span>
      </div>

      <div className="appointment-detail-grid">
        <DetailItem label="Date" value={appointment.appointmentDate} />
        <DetailItem label="Time" value={formatSlot(appointment.appointmentTime)} />
        <DetailItem label="Department" value={appointment.department} />
        <DetailItem label="Doctor" value={appointment.preferredDoctor || 'Any available doctor'} />
        <DetailItem label="Reason" value={appointment.reason} />
        <DetailItem label="Notes" value={appointment.notes || 'No notes provided'} />
      </div>
    </section>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function isAppointmentDateAllowed(date) {
  if (!date) {
    return false
  }

  return date >= getTomorrowDate()
}

function getAvailableSlots(date, doctorId, unavailability, bookedSlots) {
  if (!date) {
    return appointmentSlots
  }

  return filterDoctorSlots(appointmentSlots, doctorId, unavailability, bookedSlots)
}

function filterDoctorSlots(slots, doctorId, unavailability, bookedSlots) {
  if (!doctorId) {
    return slots
  }

  const unavailableTimes = new Set(unavailability.map((slot) => slot.startTime.slice(0, 5)))
  const bookedTimes = new Set(bookedSlots.map((slot) => slot.startTime.slice(0, 5)))
  return slots.filter((slot) => !unavailableTimes.has(slot.value) && !bookedTimes.has(slot.value))
}

function formatSlot(value) {
  const normalizedValue = value?.slice(0, 5)
  const slot = appointmentSlots.find((item) => item.value === normalizedValue)
  return slot?.label || normalizedValue || 'Not selected'
}

function formatStatus(status) {
  if (!status) {
    return 'Pending'
  }

  return status
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function getTomorrowDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default AppointmentBookingForm

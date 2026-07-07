import { useEffect, useState } from 'react'
import { bookAppointment } from '../api/appointmentApi'
import { getDoctorUnavailability, getDoctorsByDepartment } from '../api/doctorApi'

const initialForm = {
  department: '',
  doctorId: '',
  preferredDoctor: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
  contactNumber: '',
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

function AppointmentBookingForm({ token, onBooked }) {
  const [form, setForm] = useState(initialForm)
  const [doctors, setDoctors] = useState([])
  const [doctorUnavailability, setDoctorUnavailability] = useState([])
  const [message, setMessage] = useState('')
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

    getDoctorUnavailability(token, form.doctorId, form.appointmentDate)
      .then((data) => {
        if (!ignore) {
          setDoctorUnavailability(data)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setDoctorUnavailability([])
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
      setIsLoadingDoctors(Boolean(value))
    }

    if (name === 'appointmentDate') {
      setDoctorUnavailability([])
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

    if (!isAppointmentTimeAllowed(form.appointmentDate, form.appointmentTime)) {
      setMessage('Appointments must be booked at least 1 hour from now.')
      setIsSubmitting(false)
      return
    }

    try {
      const appointment = await bookAppointment(token, form)
      setForm(initialForm)
      setMessage('Appointment request submitted.')
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
              min={new Date().toISOString().slice(0, 10)}
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
              {getAvailableSlots(form.appointmentDate, form.doctorId, doctorUnavailability).map((slot) => (
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
          Contact Number
          <input
            name="contactNumber"
            onChange={updateForm}
            placeholder="Phone number for confirmation"
            value={form.contactNumber}
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
    </article>
  )
}

function isAppointmentTimeAllowed(date, time) {
  if (!date || !time) {
    return false
  }

  const requestedDateTime = new Date(`${date}T${time}`)
  const earliestAllowed = new Date(Date.now() + 60 * 60 * 1000)
  return requestedDateTime >= earliestAllowed
}

function getAvailableSlots(date, doctorId, unavailability) {
  if (!date) {
    return appointmentSlots
  }

  const today = new Date().toISOString().slice(0, 10)
  if (date !== today) {
    return filterDoctorSlots(appointmentSlots, doctorId, unavailability)
  }

  const earliestAllowed = new Date(Date.now() + 60 * 60 * 1000)
  return filterDoctorSlots(appointmentSlots, doctorId, unavailability).filter((slot) => {
    const slotStart = new Date(`${date}T${slot.value}`)
    return slotStart >= earliestAllowed
  })
}

function filterDoctorSlots(slots, doctorId, unavailability) {
  if (!doctorId) {
    return slots
  }

  const unavailableTimes = new Set(unavailability.map((slot) => slot.startTime.slice(0, 5)))
  return slots.filter((slot) => !unavailableTimes.has(slot.value))
}

export default AppointmentBookingForm

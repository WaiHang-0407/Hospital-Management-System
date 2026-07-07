import { API_BASE_URL } from './config'

export async function bookAppointment(token, payload) {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanAppointmentPayload(payload)),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to book appointment')
  }

  return data
}

export async function createDoctorAppointment(token, payload) {
  const response = await fetch(`${API_BASE_URL}/appointments/doctor`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to create appointment')
  }

  return data
}

export async function getMyAppointments(token) {
  const response = await fetch(`${API_BASE_URL}/appointments/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load appointments')
  }

  return data
}

export async function getMyDoctorAppointments(token) {
  const response = await fetch(`${API_BASE_URL}/appointments/doctor/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load doctor appointments')
  }

  return data
}

function cleanAppointmentPayload(payload) {
  return {
    ...payload,
    doctorId: payload.doctorId || null,
  }
}

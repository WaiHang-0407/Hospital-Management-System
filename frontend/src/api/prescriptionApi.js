import { API_BASE_URL } from './config'

export async function createPrescription(token, payload) {
  const response = await fetch(`${API_BASE_URL}/prescriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to create prescription')
  }

  return data
}

export async function updatePrescription(token, id, payload) {
  const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to update prescription')
  }

  return data
}

export async function deletePrescription(token, id) {
  const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || data?.error || 'Unable to delete prescription')
  }
}

export async function getMyPatientPrescriptions(token) {
  const response = await fetch(`${API_BASE_URL}/prescriptions/patient/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load prescriptions')
  }

  return data
}

export async function getMyDoctorPrescriptions(token) {
  const response = await fetch(`${API_BASE_URL}/prescriptions/doctor/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load prescriptions')
  }

  return data
}

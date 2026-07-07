import { API_BASE_URL } from './config'

export async function getDoctorsByDepartment(token, department) {
  if (!department) {
    return []
  }

  const params = new URLSearchParams({ department })
  const response = await fetch(`${API_BASE_URL}/doctors?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load doctors')
  }

  return data
}

export async function getDoctorUnavailability(token, doctorId, date) {
  if (!doctorId || !date) {
    return []
  }

  const params = new URLSearchParams({ date })
  const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/unavailability?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse(response, 'Unable to load doctor unavailable slots')
}

export async function getMyUnavailability(token) {
  const response = await fetch(`${API_BASE_URL}/doctors/me/unavailability`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse(response, 'Unable to load unavailable slots')
}

export async function addMyUnavailability(token, payload) {
  const response = await fetch(`${API_BASE_URL}/doctors/me/unavailability`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, 'Unable to block unavailable slot')
}

export async function deleteMyUnavailability(token, id) {
  const response = await fetch(`${API_BASE_URL}/doctors/me/unavailability/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || data?.error || 'Unable to remove unavailable slot')
  }
}

export async function getDoctorPatients(token) {
  const response = await fetch(`${API_BASE_URL}/doctors/patients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse(response, 'Unable to load patients')
}

async function handleResponse(response, fallback) {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || fallback)
  }

  return data
}

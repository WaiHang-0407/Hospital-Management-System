import { API_BASE_URL } from './config'

export async function getMedicines(token) {
  const response = await fetch(`${API_BASE_URL}/admin/medicines`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load medicines')
  }

  return data
}

export async function getAvailableMedicines(token) {
  const response = await fetch(`${API_BASE_URL}/medicines`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load medicines')
  }

  return data
}

export async function createMedicine(token, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/medicines`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      stockQuantity: Number(payload.stockQuantity || 0),
      price: Number(payload.price || 0),
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to add medicine')
  }

  return data
}

export async function updateMedicine(token, id, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/medicines/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      stockQuantity: Number(payload.stockQuantity || 0),
      price: Number(payload.price || 0),
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to update medicine')
  }

  return data
}

export async function deleteMedicine(token, id) {
  const response = await fetch(`${API_BASE_URL}/admin/medicines/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || data?.error || 'Unable to remove medicine')
  }
}

import { API_BASE_URL } from './config'

export async function getMyBills(token) {
  const response = await fetch(`${API_BASE_URL}/bills/patient/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load bills')
  }

  return data
}

export async function getAdminBills(token) {
  const response = await fetch(`${API_BASE_URL}/bills/admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load bills')
  }

  return data
}

export async function payBill(token, id) {
  const response = await fetch(`${API_BASE_URL}/bills/${id}/pay`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to pay bill')
  }

  return data
}

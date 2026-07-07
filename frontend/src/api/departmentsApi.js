import { API_BASE_URL } from './config'

export async function getDepartments(token) {
  const response = await fetch(`${API_BASE_URL}/admin/departments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse(response, 'Unable to load departments')
}

export async function createDepartment(token, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/departments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response, 'Unable to add department')
}

export async function addDepartmentMember(token, departmentId, userId) {
  const response = await fetch(`${API_BASE_URL}/admin/departments/${departmentId}/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })

  return handleResponse(response, 'Unable to add member')
}

export async function removeDepartmentMember(token, departmentId, userId) {
  const response = await fetch(`${API_BASE_URL}/admin/departments/${departmentId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse(response, 'Unable to remove member')
}

async function handleResponse(response, fallback) {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || data?.detail || data?.error || `${fallback} (${response.status})`)
  }

  return data
}

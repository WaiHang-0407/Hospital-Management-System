import { API_BASE_URL } from './config'

export async function getAdminUsers(token, filters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  })

  const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, 'Unable to load users'))
  }

  return data
}

export async function getAdminUserDetails(token, userId) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, 'Unable to load user details'))
  }

  return data
}

export async function createAdminUser(token, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, 'Unable to create user'))
  }

  return data
}

export async function setUserEnabled(token, userId, enabled) {
  const action = enabled ? 'activate' : 'deactivate'
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, `Unable to ${action} user`))
  }

  return data
}

export async function updateAdminUser(token, userId, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, data, 'Unable to update user'))
  }

  return data
}

function getApiErrorMessage(response, data, fallback) {
  if (response.status === 401 || response.status === 403) {
    return 'Admin access denied. Log out, log in again, and make sure this account has ADMIN role.'
  }

  return data?.message || data?.error || `${fallback} (${response.status})`
}

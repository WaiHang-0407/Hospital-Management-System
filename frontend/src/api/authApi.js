import { API_BASE_URL } from './config'

export async function signupPatient(payload) {
  return sendAuthRequest('/auth/signup/patient', payload)
}

export async function login(payload) {
  return sendAuthRequest('/auth/login', payload)
}

async function sendAuthRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getAuthErrorMessage(response, data))
  }

  return data
}

function getAuthErrorMessage(response, data) {
  if (data?.message || data?.detail || data?.error) {
    return data.message || data.detail || data.error
  }

  if (response.status === 400) {
    return 'Please check the form details and try again.'
  }

  if (response.status === 401) {
    return 'Invalid email or password.'
  }

  if (response.status === 409) {
    return 'This email is already registered.'
  }

  if (response.status >= 500) {
    return 'Server error while creating the account. Check the Spring Boot terminal.'
  }

  return `Authentication failed (${response.status})`
}

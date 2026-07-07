import { useState } from 'react'
import { login, signupPatient } from '../api/authApi'
import Brand from '../components/Brand'
import LoginForm from './LoginForm'
import PatientSignupForm from './PatientSignupForm'
import { saveStoredAuth } from './authStorage'

const initialLoginForm = {
  email: '',
  password: '',
}

const initialSignupForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  address: '',
  emergencyContact: '',
}

function AuthPage({ apiStatus, onAuthenticated }) {
  const [authMode, setAuthMode] = useState('login')
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [signupForm, setSignupForm] = useState(initialSignupForm)
  const [authMessage, setAuthMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateLoginForm(event) {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  function updateSignupForm(event) {
    const { name, value } = event.target
    setSignupForm((current) => ({ ...current, [name]: value }))
  }

  async function submitLogin(event) {
    event.preventDefault()
    await submitAuth(() => login(loginForm))
  }

  async function submitSignup(event) {
    event.preventDefault()
    await submitAuth(() => signupPatient({
      ...signupForm,
      dateOfBirth: signupForm.dateOfBirth || null,
    }))
  }

  async function submitAuth(request) {
    setIsSubmitting(true)
    setAuthMessage('')

    try {
      const auth = await request()
      saveStoredAuth(auth)
      setLoginForm(initialLoginForm)
      setSignupForm(initialSignupForm)
      onAuthenticated(auth)
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode(mode) {
    setAuthMode(mode)
    setAuthMessage('')
  }

  return (
    <main className="auth-page">
      <section className="auth-hero" aria-label="Hospital system overview">
        <Brand className="auth-brand" />
        <div className="auth-copy">
          <p className="eyebrow">Patient Access Portal</p>
          <h1>Manage care from registration to follow-up.</h1>
          <p>
            Patients can create an account, sign in, and enter the correct
            dashboard based on their assigned role.
          </p>
        </div>
        <div className="auth-status">
          <span className={`api-pill ${apiStatus === 'API Online' ? 'online' : ''}`}>
            {apiStatus}
          </span>
        </div>
      </section>

      <section className="auth-panel" aria-label="Authentication form">
        <div className="auth-tabs">
          <button
            className={authMode === 'login' ? 'active' : ''}
            type="button"
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            className={authMode === 'signup' ? 'active' : ''}
            type="button"
            onClick={() => switchMode('signup')}
          >
            Patient Sign Up
          </button>
        </div>

        {authMode === 'login' ? (
          <LoginForm
            form={loginForm}
            isSubmitting={isSubmitting}
            message={authMessage}
            onChange={updateLoginForm}
            onSubmit={submitLogin}
          />
        ) : (
          <PatientSignupForm
            form={signupForm}
            isSubmitting={isSubmitting}
            message={authMessage}
            onChange={updateSignupForm}
            onSubmit={submitSignup}
          />
        )}
      </section>
    </main>
  )
}

export default AuthPage

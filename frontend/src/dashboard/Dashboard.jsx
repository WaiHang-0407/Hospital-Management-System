import { useState } from 'react'
import AdminActivityPanel from './AdminActivityPanel'
import AdminDepartmentsPanel from './AdminDepartmentsPanel'
import AdminModules from './AdminModules'
import AdminUsersPanel from './AdminUsersPanel'
import AppointmentBookingForm from './AppointmentBookingForm'
import AppointmentPanel from './AppointmentPanel'
import DepartmentPanel from './DepartmentPanel'
import DoctorWorkspace from './DoctorWorkspace'
import QuickActions from './QuickActions'
import Sidebar from './Sidebar'
import StatGrid from './StatGrid'
import {
  adminStats,
  patientAppointments,
  patientStats,
  staffAppointments,
  staffStats,
} from './data'

function Dashboard({ auth, onLogout }) {
  const isAdmin = auth?.roles?.includes('ADMIN')
  const isDoctor = auth?.roles?.includes('DOCTOR')
  const isPatient = auth?.roles?.includes('PATIENT')
  const primaryRole = getPrimaryRole(auth)
  const [activePage, setActivePage] = useState('dashboard')
  const [bookedAppointments, setBookedAppointments] = useState([])
  const visibleStats = isAdmin ? adminStats : isPatient ? patientStats : staffStats
  const visibleAppointments = isPatient
    ? [...bookedAppointments.map(toAppointmentCard), ...patientAppointments]
    : staffAppointments

  function addBookedAppointment(appointment) {
    setBookedAppointments((current) => [appointment, ...current])
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        isAdmin={isAdmin}
        isDoctor={isDoctor}
        isPatient={isPatient}
        onPageChange={setActivePage}
        primaryRole={primaryRole}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{getPageEyebrow(activePage, primaryRole)}</p>
            <h1>{getPageTitle(activePage, auth, isAdmin, isPatient)}</h1>
          </div>
          <div className="topbar-actions">
            <span className="role-pill">{auth.roles.join(', ')}</span>
            <button className="secondary-button" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  )

  function renderContent() {
    if (isAdmin && activePage === 'users') {
      return <AdminUsersPanel token={auth.token} />
    }

    if (isAdmin && activePage === 'departments') {
      return <AdminDepartmentsPanel token={auth.token} />
    }

    if (isDoctor && (activePage === 'availability' || activePage === 'appointments' || activePage === 'patients')) {
      return <DoctorWorkspace activePage={activePage} token={auth.token} />
    }

    if (isAdmin && activePage !== 'dashboard') {
      return <PlaceholderPage title={getPageTitle(activePage, auth, isAdmin, isPatient)} />
    }

    return (
      <>
        <StatGrid stats={visibleStats} />

        {isAdmin ? (
          <section className="dashboard-grid admin-dashboard-grid">
            <AdminModules />
            <QuickActions isAdmin={isAdmin} isPatient={isPatient} />
            <AdminActivityPanel />
            <DepartmentPanel isPatient={isPatient} />
          </section>
        ) : isDoctor ? (
          <section className="dashboard-grid">
            <QuickActions isAdmin={isAdmin} isPatient={isPatient} />
            <DepartmentPanel isPatient={isPatient} />
          </section>
        ) : (
          <section className="dashboard-grid">
            <AppointmentPanel appointments={visibleAppointments} isPatient={isPatient} />
            {isPatient && (
              <AppointmentBookingForm token={auth.token} onBooked={addBookedAppointment} />
            )}
            <QuickActions isAdmin={isAdmin} isPatient={isPatient} />
            <DepartmentPanel isPatient={isPatient} />
          </section>
        )}
      </>
    )
  }
}

function PlaceholderPage({ title }) {
  return (
    <article className="panel placeholder-page">
      <p className="eyebrow">Coming Next</p>
      <h2>{title}</h2>
      <p>This section is ready for its dedicated workflow.</p>
    </article>
  )
}

function getPageEyebrow(activePage, primaryRole) {
  if (activePage === 'dashboard') {
    return `${primaryRole} Dashboard`
  }

  return primaryRole
}

function getPageTitle(activePage, auth, isAdmin, isPatient) {
  if (isAdmin && activePage === 'users') {
    return 'Users & Roles'
  }

  if (isAdmin && activePage === 'departments') {
    return 'Departments'
  }

  if (isAdmin && activePage === 'approvals') {
    return 'Approvals'
  }

  if (isAdmin && activePage === 'audit') {
    return 'Audit Logs'
  }

  if (isAdmin && activePage === 'settings') {
    return 'Settings'
  }

  if (isAdmin) {
    return 'Aurora Admin Console'
  }

  if (auth?.roles?.includes('DOCTOR')) {
    if (activePage === 'availability') {
      return 'Doctor Availability'
    }
    if (activePage === 'appointments') {
      return 'Doctor Appointments'
    }
    if (activePage === 'patients') {
      return 'Patient Directory'
    }
    return `Welcome, ${auth.fullName}`
  }

  if (isPatient) {
    return `Welcome, ${auth.fullName}`
  }

  return 'Aurora Operations Dashboard'
}

function getPrimaryRole(auth) {
  if (!auth?.roles?.length) {
    return 'Guest'
  }

  return auth.roles[0]
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function toAppointmentCard(appointment) {
  return {
    time: appointment.appointmentDate,
    patient: appointment.reason,
    doctor: appointment.preferredDoctor || 'Any available doctor',
    type: appointment.department,
    status: appointment.status,
  }
}

export default Dashboard

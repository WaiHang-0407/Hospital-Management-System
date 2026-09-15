import { useEffect, useState } from 'react'
import { cancelAppointment, getMyAppointments, rescheduleAppointment } from '../api/appointmentApi'
import AdminActivityPanel from './AdminActivityPanel'
import AdminAppointmentsPanel from './AdminAppointmentsPanel'
import AdminBillingPanel from './AdminBillingPanel'
import AdminDepartmentsPanel from './AdminDepartmentsPanel'
import AdminMedicinesPanel from './AdminMedicinesPanel'
import AdminModules from './AdminModules'
import AdminUsersPanel from './AdminUsersPanel'
import AppointmentBookingForm from './AppointmentBookingForm'
import AppointmentPanel from './AppointmentPanel'
import DepartmentPanel from './DepartmentPanel'
import DoctorWorkspace from './DoctorWorkspace'
import PatientBillsPanel from './PatientBillsPanel'
import PatientHome from './PatientHome'
import PatientPrescriptionsPanel from './PatientPrescriptionsPanel'
import QuickActions from './QuickActions'
import Sidebar from './Sidebar'
import StatGrid from './StatGrid'
import {
  adminStats,
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
  const [patientAppointments, setPatientAppointments] = useState([])
  const [appointmentMessage, setAppointmentMessage] = useState('')
  const visibleStats = isAdmin ? adminStats : isPatient ? patientStats : staffStats
  const visibleAppointments = isPatient
    ? [...patientAppointments]
        .sort(compareAppointments)
        .map(toAppointmentCard)
    : staffAppointments

  useEffect(() => {
    if (!isPatient) {
      return
    }

    let ignore = false

    getMyAppointments(auth.token)
      .then((appointments) => {
        if (!ignore) {
          setPatientAppointments(appointments)
          setAppointmentMessage('')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setPatientAppointments([])
          setAppointmentMessage(error.message)
        }
      })

    return () => {
      ignore = true
    }
  }, [auth.token, isPatient])

  function addBookedAppointment(appointment) {
    setPatientAppointments((current) => [appointment, ...current])
  }

  async function updateAppointment(id, updater) {
    const updatedAppointment = await updater()
    setPatientAppointments((current) => current.map((appointment) => (
      appointment.id === id ? updatedAppointment : appointment
    )))
    return updatedAppointment
  }

  function handleRescheduleAppointment(id, payload) {
    return updateAppointment(id, () => rescheduleAppointment(auth.token, id, payload))
  }

  function handleCancelAppointment(id) {
    return updateAppointment(id, () => cancelAppointment(auth.token, id))
  }

  return (
    <div className={`app-shell ${isPatient ? 'patient-shell' : 'sidebar-shell'}`}>
      <Sidebar
        activePage={activePage}
        isAdmin={isAdmin}
        isDoctor={isDoctor}
        isPatient={isPatient}
        onPageChange={setActivePage}
        onLogout={onLogout}
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

    if (isAdmin && activePage === 'appointments') {
      return <AdminAppointmentsPanel token={auth.token} />
    }

    if (isAdmin && activePage === 'medicines') {
      return <AdminMedicinesPanel token={auth.token} />
    }

    if (isAdmin && activePage === 'billing') {
      return <AdminBillingPanel token={auth.token} />
    }

    if (isDoctor && (activePage === 'availability' || activePage === 'appointments' || activePage === 'patients')) {
      return <DoctorWorkspace activePage={activePage} token={auth.token} />
    }

    if (isPatient && activePage === 'dashboard') {
      return (
        <PatientHome
          fullName={auth.fullName}
          onBookAppointment={() => setActivePage('appointments')}
        />
      )
    }

    if (isPatient && activePage === 'appointments') {
      return (
        <section className="dashboard-grid patient-appointments-grid">
          <AppointmentPanel
            appointments={visibleAppointments}
            emptyMessage={appointmentMessage || 'No appointments found.'}
            isPatient={isPatient}
            onCancel={handleCancelAppointment}
            onReschedule={handleRescheduleAppointment}
          />
          <AppointmentBookingForm token={auth.token} onBooked={addBookedAppointment} />
        </section>
      )
    }

    if (isPatient && activePage === 'records') {
      return <PatientPrescriptionsPanel token={auth.token} />
    }

    if (isPatient && activePage === 'billing') {
      return <PatientBillsPanel token={auth.token} />
    }

    if (isPatient && activePage !== 'dashboard') {
      return <PlaceholderPage title={getPageTitle(activePage, auth, isAdmin, isPatient)} />
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

  if (isAdmin && activePage === 'appointments') {
    return 'Appointments'
  }

  if (isAdmin && activePage === 'medicines') {
    return 'Medicine'
  }

  if (isAdmin && activePage === 'billing') {
    return 'Billing'
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
    id: appointment.id,
    date: appointment.appointmentDate,
    time: appointment.appointmentTime.slice(0, 5),
    patient: appointment.reason,
    doctor: appointment.preferredDoctor || 'Any available doctor',
    type: appointment.department,
    status: formatStatus(appointment.status),
    rawStatus: appointment.status,
    doctorId: appointment.doctorId,
  }
}

function compareAppointments(first, second) {
  return new Date(`${second.appointmentDate}T${second.appointmentTime}`)
    - new Date(`${first.appointmentDate}T${first.appointmentTime}`)
}

function formatStatus(status) {
  if (!status) {
    return 'Pending'
  }

  return status
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

export default Dashboard

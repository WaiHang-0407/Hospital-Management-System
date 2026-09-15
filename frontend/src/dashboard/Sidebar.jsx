import { useState } from 'react'
import Brand from '../components/Brand'

function Sidebar({ activePage, isAdmin, isDoctor, isPatient, onLogout, onPageChange, primaryRole }) {
  const items = getNavigationItems(isAdmin, isDoctor, isPatient)
  const profileItems = getProfileItems(isPatient)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  function openPage(pageId) {
    onPageChange(pageId)
    setIsProfileOpen(false)
  }

  if (!isPatient) {
    return (
      <aside className="sidebar" aria-label="Main navigation">
        <div>
          <Brand subtitle={`${primaryRole} Portal`} />

          <nav className="nav-list">
            {items.map((item) => (
              <button
                className={activePage === item.id ? 'active' : ''}
                key={item.id}
                type="button"
                onClick={() => onPageChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button className="sidebar-logout-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </aside>
    )
  }

  return (
    <header className="top-navbar patient-navbar">
      <button
        className="brand-button"
        type="button"
        onClick={() => openPage('dashboard')}
      >
        <Brand subtitle={`${primaryRole} Portal`} />
      </button>

      {items.length > 0 && (
        <nav className="nav-list" aria-label="Main navigation">
          {items.map((item) => (
            <button
              className={activePage === item.id ? 'active' : ''}
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <div className="navbar-spacer" />

      <div className="profile-menu">
        <button
          aria-expanded={isProfileOpen}
          aria-label="Open profile menu"
          className="profile-icon-button"
          type="button"
          onClick={() => setIsProfileOpen((current) => !current)}
        >
          <span>U</span>
        </button>

        {isProfileOpen && (
          <div className="profile-dropdown">
            {profileItems.map((item) => (
              <button
                className={activePage === item.id ? 'active' : ''}
                key={item.id}
                type="button"
                onClick={() => openPage(item.id)}
              >
                {item.label}
              </button>
            ))}

            <button
              className="profile-logout-button"
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function getNavigationItems(isAdmin, isDoctor, isPatient) {
  if (isAdmin) {
    return [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'users', label: 'Users & Roles' },
      { id: 'departments', label: 'Departments' },
      { id: 'appointments', label: 'Appointments' },
      { id: 'medicines', label: 'Medicine' },
      { id: 'billing', label: 'Billing' },
      { id: 'approvals', label: 'Approvals' },
      { id: 'audit', label: 'Audit Logs' },
      { id: 'settings', label: 'Settings' },
    ]
  }

  if (isDoctor) {
    return [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'availability', label: 'Availability' },
      { id: 'appointments', label: 'Appointments' },
      { id: 'patients', label: 'Patients' },
    ]
  }

  if (isPatient) {
    return []
  }

  return [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'patients', label: 'Patients' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'billing', label: 'Billing' },
    { id: 'pharmacy', label: 'Pharmacy' },
  ]
}

function getProfileItems(isPatient) {
  if (isPatient) {
    return [
      { id: 'profile', label: 'Profile' },
      { id: 'appointments', label: 'My Visits' },
      { id: 'records', label: 'Medical Records' },
      { id: 'billing', label: 'My Bills' },
    ]
  }

  return [
    { id: 'profile', label: 'Profile' },
  ]
}

export default Sidebar

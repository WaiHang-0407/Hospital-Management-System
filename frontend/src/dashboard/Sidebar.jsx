import Brand from '../components/Brand'

function Sidebar({ activePage, isAdmin, isDoctor, isPatient, onPageChange, primaryRole }) {
  const items = getNavigationItems(isAdmin, isDoctor, isPatient)

  return (
    <aside className="sidebar" aria-label="Main navigation">
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
    </aside>
  )
}

function getNavigationItems(isAdmin, isDoctor, isPatient) {
  if (isAdmin) {
    return [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'users', label: 'Users & Roles' },
      { id: 'departments', label: 'Departments' },
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
    return [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'appointments', label: 'My Visits' },
      { id: 'records', label: 'Medical Records' },
      { id: 'billing', label: 'My Bills' },
      { id: 'profile', label: 'Profile' },
    ]
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

export default Sidebar

import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  createAdminUser,
  getAdminUserDetails,
  getAdminUsers,
  setUserEnabled,
  updateAdminUser,
} from '../api/adminUsersApi'

const roles = ['ALL', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ACCOUNTANT', 'PATIENT']
const editableRoles = roles.filter((role) => role !== 'ALL')
const statuses = ['ALL', 'ACTIVE', 'INACTIVE']
const specializations = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Emergency',
]

const initialCreateForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'PATIENT',
  doctorSpecialization: '',
}

function AdminUsersPanel({ token }) {
  const [users, setUsers] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    role: 'ALL',
    status: 'ALL',
    sort: 'createdAt',
    direction: 'desc',
    size: 10,
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [userDetails, setUserDetails] = useState({})
  const [detailsLoadingId, setDetailsLoadingId] = useState(null)
  const [editForm, setEditForm] = useState({ role: '', doctorSpecialization: '' })
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [isCreating, setIsCreating] = useState(false)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const data = await getAdminUsers(token, { ...filters, page })
      setUsers(data.content || [])
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, token])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers()
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [loadUsers])

  function updateFilter(event) {
    const { name, value } = event.target
    setPage(0)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function sortBy(field) {
    setPage(0)
    setFilters((current) => ({
      ...current,
      sort: field,
      direction: current.sort === field && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  async function toggleUser(user) {
    setMessage('')

    try {
      const updatedUser = await setUserEnabled(token, user.id, !user.enabled)
      setUsers((current) => current.map((item) => (
        item.id === updatedUser.id ? updatedUser : item
      )))
    } catch (error) {
      setMessage(error.message)
    }
  }

  function startEditing(user) {
    setMessage('')
    setEditingUserId(user.id)
    setEditForm({
      role: user.roles[0] || 'PATIENT',
      doctorSpecialization: user.doctorSpecialization || '',
    })
  }

  async function toggleUserDetails(user) {
    if (expandedUserId === user.id) {
      setExpandedUserId(null)
      return
    }

    setExpandedUserId(user.id)
    setMessage('')

    if (userDetails[user.id]) {
      return
    }

    setDetailsLoadingId(user.id)

    try {
      const details = await getAdminUserDetails(token, user.id)
      setUserDetails((current) => ({ ...current, [user.id]: details }))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setDetailsLoadingId(null)
    }
  }

  function cancelEditing() {
    setEditingUserId(null)
    setEditForm({ role: '', doctorSpecialization: '' })
  }

  function updateEditForm(event) {
    const { name, value } = event.target
    setEditForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'role' && value !== 'DOCTOR' ? { doctorSpecialization: '' } : {}),
    }))
  }

  function updateCreateForm(event) {
    const { name, value } = event.target
    setCreateForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'role' && value !== 'DOCTOR' ? { doctorSpecialization: '' } : {}),
    }))
  }

  async function submitCreateUser(event) {
    event.preventDefault()
    setMessage('')
    setIsCreating(true)

    try {
      await createAdminUser(token, createForm)
      setCreateForm(initialCreateForm)
      setPage(0)
      await loadUsers()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  async function saveUser(user) {
    setMessage('')

    try {
      const updatedUser = await updateAdminUser(token, user.id, editForm)
      setUsers((current) => current.map((item) => (
        item.id === updatedUser.id ? updatedUser : item
      )))
      cancelEditing()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const totalPages = Math.max(Math.ceil(totalElements / filters.size), 1)

  return (
    <article className="panel admin-users-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Users & Roles</p>
          <h2>User Access Management</h2>
        </div>
        <span className="role-pill">{totalElements} users</span>
      </div>

      <form className="admin-create-user-form" onSubmit={submitCreateUser}>
        <div className="form-grid">
          <label>
            Full Name
            <input
              name="fullName"
              onChange={updateCreateForm}
              required
              value={createForm.fullName}
            />
          </label>

          <label>
            Email
            <input
              name="email"
              onChange={updateCreateForm}
              required
              type="email"
              value={createForm.email}
            />
          </label>

          <label>
            Temporary Password
            <input
              minLength="8"
              name="password"
              onChange={updateCreateForm}
              required
              type="password"
              value={createForm.password}
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              onChange={updateCreateForm}
              value={createForm.phone}
            />
          </label>

          <label>
            Role
            <select name="role" onChange={updateCreateForm} value={createForm.role}>
              {editableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          {createForm.role === 'DOCTOR' && (
            <label>
              Specialist / Department
              <select
                name="doctorSpecialization"
                onChange={updateCreateForm}
                required
                value={createForm.doctorSpecialization}
              >
                <option value="">Select specialist</option>
                {specializations.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <button disabled={isCreating} type="submit">
          {isCreating ? 'Creating...' : 'Create User'}
        </button>
      </form>

      <div className="user-toolbar">
        <label>
          Search
          <input
            name="search"
            onChange={updateFilter}
            placeholder="Name, email, phone"
            value={filters.search}
          />
        </label>

        <label>
          Role
          <select name="role" onChange={updateFilter} value={filters.role}>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select name="status" onChange={updateFilter} value={filters.status}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      {message && <p className="form-message">{message}</p>}

      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => sortBy('fullName')}>Name</button>
              </th>
              <th>
                <button type="button" onClick={() => sortBy('email')}>Email</button>
              </th>
              <th>Role</th>
              <th>Specialist / Department</th>
              <th>
                <button type="button" onClick={() => sortBy('enabled')}>Status</button>
              </th>
              <th>
                <button type="button" onClick={() => sortBy('createdAt')}>Created</button>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <Fragment key={user.id}>
                <tr className="clickable-row" onClick={() => toggleUserDetails(user)}>
                  <td>
                    <strong>{user.fullName}</strong>
                    <span>{user.phone || 'No phone'}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {editingUserId === user.id ? (
                      <select name="role" onChange={updateEditForm} onClick={(event) => event.stopPropagation()} value={editForm.role}>
                        {editableRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="role-list">
                        {user.roles.map((role) => (
                          <span className="mini-chip" key={role}>{role}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingUserId === user.id && editForm.role === 'DOCTOR' ? (
                      <select
                        name="doctorSpecialization"
                        onChange={updateEditForm}
                        onClick={(event) => event.stopPropagation()}
                        required
                        value={editForm.doctorSpecialization}
                      >
                        <option value="">Select specialist</option>
                        {specializations.map((specialization) => (
                          <option key={specialization} value={specialization}>
                            {specialization}
                          </option>
                        ))}
                      </select>
                    ) : (
                      user.doctorSpecialization || '-'
                    )}
                  </td>
                  <td>
                    <span className={`mini-chip ${user.enabled ? 'active' : 'inactive'}`}>
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td onClick={(event) => event.stopPropagation()}>
                    {editingUserId === user.id ? (
                      <div className="table-actions">
                        <button type="button" onClick={() => saveUser(user)}>Save</button>
                        <button className="secondary-button" type="button" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="table-actions">
                        <button className="secondary-button" type="button" onClick={() => startEditing(user)}>
                          Edit
                        </button>
                        <button
                          className={user.enabled ? 'danger-button' : 'secondary-button'}
                          type="button"
                          onClick={() => toggleUser(user)}
                        >
                          {user.enabled ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {expandedUserId === user.id && (
                  <tr>
                    <td colSpan="7">
                      {detailsLoadingId === user.id ? (
                        <p className="empty-note">Loading user details...</p>
                      ) : (
                        <UserDetailsPanel details={userDetails[user.id]} user={user} />
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan="7">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <button
          className="secondary-button"
          disabled={page === 0 || isLoading}
          type="button"
          onClick={() => setPage((current) => Math.max(current - 1, 0))}
        >
          Previous
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button
          className="secondary-button"
          disabled={page + 1 >= totalPages || isLoading}
          type="button"
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </article>
  )
}

function UserDetailsPanel({ details, user }) {
  if (!details) {
    return <p className="empty-note">No details loaded.</p>
  }

  const isDoctor = user.roles.includes('DOCTOR')
  const isPatient = user.roles.includes('PATIENT')

  return (
    <div className="admin-user-detail-shell">
      <section className="admin-user-summary-card">
        <div className="admin-user-summary-title">
          <p className="eyebrow">Selected User</p>
          <h3>{details.user.fullName}</h3>
          <span>{details.user.email}</span>
        </div>

        <div className="role-list admin-user-summary-roles">
          {details.user.roles.map((role) => (
            <span className="mini-chip" key={role}>{role}</span>
          ))}
          <span className={`mini-chip ${details.user.enabled ? 'active' : 'inactive'}`}>
            {details.user.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="admin-user-summary-grid">
          <span>
            <strong>Phone</strong>
            {details.user.phone || '-'}
          </span>
          <span>
            <strong>Created</strong>
            {formatDate(details.user.createdAt)}
          </span>
          {isDoctor && (
            <span>
              <strong>Specialist</strong>
              {details.user.doctorSpecialization || '-'}
            </span>
          )}
          {isPatient && (
            <span>
              <strong>Patient Record</strong>
              Registered
            </span>
          )}
        </div>
      </section>

      <div className="admin-user-detail-grid">
        <DetailSection
          count={details.appointments.length}
          emptyText="No appointments found."
          title="Appointments"
        >
          {details.appointments.map((appointment) => (
            <div className="admin-detail-row" key={appointment.id}>
              <div>
                <strong>{appointment.appointmentDate} at {appointment.appointmentTime.slice(0, 5)}</strong>
                <span>{appointment.department || 'No department'}</span>
              </div>
              <div>
                <strong>{appointment.reason || 'No reason provided'}</strong>
                <span>{appointment.doctorName || appointment.patientName || 'No assigned person'}</span>
              </div>
              <span className="status-chip">{formatStatus(appointment.status)}</span>
            </div>
          ))}
        </DetailSection>

        <DetailSection
          count={details.prescriptions.length}
          emptyText="No prescriptions found."
          title="Prescriptions / Medicine"
        >
          {details.prescriptions.map((prescription) => (
            <div className="admin-detail-row" key={prescription.id}>
              <div>
                <strong>{prescription.diagnosis || 'No diagnosis recorded'}</strong>
                <span>
                  {prescription.appointmentDate
                    ? `${prescription.appointmentDate} at ${prescription.appointmentTime.slice(0, 5)}`
                    : 'No appointment date'}
                </span>
              </div>
              <div className="medicine-chip-list">
                {prescription.items.length === 0 ? (
                  <span className="mini-chip inactive">No medicine</span>
                ) : (
                  prescription.items.map((item) => (
                    <span className="mini-chip" key={item.id}>{item.medicineName}</span>
                  ))
                )}
              </div>
            </div>
          ))}
        </DetailSection>

        {isPatient && (
          <DetailSection
            count={details.bills.length}
            emptyText="No bills found."
            title="Billing"
          >
            {details.bills.map((bill) => (
              <div className="admin-detail-row" key={bill.id}>
                <div>
                  <strong>RM {Number(bill.amount).toFixed(2)}</strong>
                  <span>{bill.appointmentDate || 'No appointment date'}</span>
                </div>
                <div className="medicine-chip-list">
                  {bill.items.length === 0 ? (
                    <span className="mini-chip inactive">No bill items</span>
                  ) : (
                    bill.items.map((item) => (
                      <span className="mini-chip" key={item.id}>{item.itemName}</span>
                    ))
                  )}
                </div>
                <span className="status-chip">{formatStatus(bill.status)}</span>
              </div>
            ))}
          </DetailSection>
        )}
      </div>
    </div>
  )
}

function DetailSection({ children, count, emptyText, title }) {
  return (
    <section className="admin-detail-card">
      <div className="admin-detail-card-header">
        <h3>{title}</h3>
        <span className="mini-chip">{count}</span>
      </div>

      {count === 0 ? (
        <p className="empty-note">{emptyText}</p>
      ) : (
        <div className="admin-detail-list">{children}</div>
      )}
    </section>
  )
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatStatus(status) {
  return status
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

export default AdminUsersPanel

import { useEffect, useMemo, useState } from 'react'
import { getAdminUsers } from '../api/adminUsersApi'
import {
  addDepartmentMember,
  createDepartment,
  getDepartments,
  removeDepartmentMember,
} from '../api/departmentsApi'

const initialDepartmentForm = {
  name: '',
  description: '',
}

function AdminDepartmentsPanel({ token }) {
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(initialDepartmentForm)
  const [selectedUsers, setSelectedUsers] = useState({})
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const staffUsers = useMemo(() => users.filter((user) => !user.roles.includes('PATIENT')), [users])

  useEffect(() => {
    let ignore = false

    Promise.all([
      getDepartments(token),
      getAdminUsers(token, { status: 'ACTIVE', sort: 'fullName', direction: 'asc', page: 0, size: 100 }),
    ])
      .then(([departmentData, userData]) => {
        if (!ignore) {
          setDepartments(departmentData)
          setUsers(userData.content || [])
          setMessage('')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [token])

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updateSelectedUser(departmentId, userId) {
    setSelectedUsers((current) => ({ ...current, [departmentId]: userId }))
  }

  async function submitDepartment(event) {
    event.preventDefault()
    setMessage('')

    try {
      const department = await createDepartment(token, form)
      setDepartments((current) => [...current, department].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(initialDepartmentForm)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addMember(departmentId) {
    const userId = selectedUsers[departmentId]
    if (!userId) {
      setMessage('Select a user before adding a member.')
      return
    }

    try {
      const department = await addDepartmentMember(token, departmentId, userId)
      replaceDepartment(department)
      updateSelectedUser(departmentId, '')
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function removeMember(departmentId, userId) {
    try {
      const department = await removeDepartmentMember(token, departmentId, userId)
      replaceDepartment(department)
      setMessage('')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function replaceDepartment(department) {
    setDepartments((current) => current.map((item) => (
      item.id === department.id ? department : item
    )))
  }

  return (
    <section className="department-admin-layout">
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Departments</p>
            <h2>Add Department</h2>
          </div>
        </div>

        <form className="booking-form" onSubmit={submitDepartment}>
          <label>
            Department Name
            <input
              name="name"
              onChange={updateForm}
              placeholder="e.g. Radiology"
              required
              value={form.name}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              onChange={updateForm}
              placeholder="Short purpose of this department"
              rows="3"
              value={form.description}
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button disabled={isLoading} type="submit">Add Department</button>
        </form>
      </article>

      <div className="department-admin-list">
        {departments.map((department) => (
          <article className="panel department-admin-card" key={department.id}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">{department.members.length} members</p>
                <h2>{department.name}</h2>
                <p>{department.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="member-add-row">
              <select
                onChange={(event) => updateSelectedUser(department.id, event.target.value)}
                value={selectedUsers[department.id] || ''}
              >
                <option value="">Select member</option>
                {staffUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.roles.join(', ')})
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => addMember(department.id)}>Add</button>
            </div>

            <div className="member-list">
              {department.members.map((member) => (
                <div className="member-row" key={member.userId}>
                  <div>
                    <strong>{member.fullName}</strong>
                    <span>{member.email}</span>
                    <div className="role-list">
                      {member.roles.map((role) => (
                        <span className="mini-chip" key={role}>{role}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => removeMember(department.id, member.userId)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              {department.members.length === 0 && (
                <p className="empty-note">No members assigned yet.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AdminDepartmentsPanel

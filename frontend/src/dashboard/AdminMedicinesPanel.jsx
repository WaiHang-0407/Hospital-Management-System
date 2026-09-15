import { useEffect, useState } from 'react'
import { createMedicine, deleteMedicine, getMedicines, updateMedicine } from '../api/medicineApi'

const initialMedicineForm = {
  name: '',
  category: '',
  strength: '',
  unit: '',
  stockQuantity: 0,
  price: 0,
}

function AdminMedicinesPanel({ token }) {
  const [medicines, setMedicines] = useState([])
  const [form, setForm] = useState(initialMedicineForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    getMedicines(token)
      .then((data) => {
        if (!ignore) {
          setMedicines(data)
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

  async function submitMedicine(event) {
    event.preventDefault()
    setMessage('')

    try {
      const medicine = editingId
        ? await updateMedicine(token, editingId, form)
        : await createMedicine(token, form)

      setMedicines((current) => {
        const next = editingId
          ? current.map((item) => (item.id === medicine.id ? medicine : item))
          : [...current, medicine]

        return next.sort((a, b) => a.name.localeCompare(b.name))
      })
      setForm(initialMedicineForm)
      setEditingId(null)
      setMessage(editingId ? 'Medicine updated.' : 'Medicine added.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function startEdit(medicine) {
    setEditingId(medicine.id)
    setForm({
      name: medicine.name,
      category: medicine.category || '',
      strength: medicine.strength || '',
      unit: medicine.unit || '',
      stockQuantity: medicine.stockQuantity,
      price: medicine.price || 0,
    })
    setMessage('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(initialMedicineForm)
    setMessage('')
  }

  async function removeMedicine(id) {
    setMessage('')

    try {
      await deleteMedicine(token, id)
      setMedicines((current) => current.filter((medicine) => medicine.id !== id))
      if (editingId === id) {
        cancelEdit()
      }
      setMessage('Medicine removed.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section className="medicine-admin-layout">
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Medicine</p>
            <h2>{editingId ? 'Edit Medicine' : 'Add Medicine'}</h2>
          </div>
        </div>

        <form className="booking-form" onSubmit={submitMedicine}>
          <label>
            Medicine Name
            <input
              name="name"
              onChange={updateForm}
              placeholder="e.g. Paracetamol"
              required
              value={form.name}
            />
          </label>

          <div className="form-grid">
            <label>
              Category
              <input
                name="category"
                onChange={updateForm}
                placeholder="Pain relief"
                value={form.category}
              />
            </label>
            <label>
              Strength
              <input
                name="strength"
                onChange={updateForm}
                placeholder="500mg"
                value={form.strength}
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Unit
              <input
                name="unit"
                onChange={updateForm}
                placeholder="Tablet, capsule, bottle"
                value={form.unit}
              />
            </label>
            <label>
              Stock Quantity
              <input
                min="0"
                name="stockQuantity"
                onChange={updateForm}
                required
                type="number"
                value={form.stockQuantity}
              />
            </label>
            <label>
              Price (RM)
              <input
                min="0"
                name="price"
                onChange={updateForm}
                required
                step="0.01"
                type="number"
                value={form.price}
              />
            </label>
          </div>

          {message && <p className="form-message neutral">{message}</p>}

          <div className="table-actions">
            <button disabled={isLoading} type="submit">
              {editingId ? 'Save Medicine' : 'Add Medicine'}
            </button>
            {editingId && (
              <button className="secondary-button" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </article>

      <article className="panel medicine-list-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{medicines.length} items</p>
            <h2>Medicine List</h2>
          </div>
        </div>

        <div className="appointment-table-wrap">
          {medicines.length === 0 ? (
            <p className="empty-note">No medicines added yet.</p>
          ) : (
            <table className="appointment-table medicine-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Strength</th>
                  <th>Unit</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.category || '-'}</td>
                    <td>{medicine.strength || '-'}</td>
                    <td>{medicine.unit || '-'}</td>
                    <td>{medicine.stockQuantity}</td>
                    <td>RM {Number(medicine.price || 0).toFixed(2)}</td>
                    <td>
                      <span className="status-chip">{medicine.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="secondary-button" type="button" onClick={() => startEdit(medicine)}>
                          Edit
                        </button>
                        <button className="danger-button" type="button" onClick={() => removeMedicine(medicine.id)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </article>
    </section>
  )
}

export default AdminMedicinesPanel

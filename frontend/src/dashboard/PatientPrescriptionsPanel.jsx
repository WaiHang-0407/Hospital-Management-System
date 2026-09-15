import { useEffect, useState } from 'react'
import { getMyPatientPrescriptions } from '../api/prescriptionApi'

function PatientPrescriptionsPanel({ token }) {
  const [prescriptions, setPrescriptions] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    let ignore = false

    getMyPatientPrescriptions(token)
      .then((data) => {
        if (!ignore) {
          setPrescriptions(data)
          setMessage('')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.message)
        }
      })

    return () => {
      ignore = true
    }
  }, [token])

  return (
    <article className="panel records-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Medical Records</p>
          <h2>Prescriptions</h2>
        </div>
      </div>

      {message && <p className="form-message neutral">{message}</p>}

      {prescriptions.length === 0 && !message ? (
        <p className="empty-note">No prescriptions available yet.</p>
      ) : (
        <div className="prescription-list">
          {prescriptions.map((prescription) => (
            <section className="prescription-card" key={prescription.id}>
              <div className="prescription-card-header">
                <div>
                  <strong>{prescription.diagnosis}</strong>
                  <span>
                    {prescription.appointmentDate} at {prescription.appointmentTime.slice(0, 5)}
                  </span>
                </div>
                <span className="status-chip">{prescription.department}</span>
              </div>

              <div className="prescription-meta">
                <span>Doctor: {prescription.doctorName}</span>
                {prescription.notes && <span>Notes: {prescription.notes}</span>}
              </div>

              <div className="appointment-table-wrap">
                <table className="appointment-table prescription-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.medicineName}</td>
                        <td>{item.dosage}</td>
                        <td>{item.frequency}</td>
                        <td>{item.duration}</td>
                        <td>{item.instructions || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}

export default PatientPrescriptionsPanel

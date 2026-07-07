function AppointmentPanel({ appointments, isPatient }) {
  return (
    <article className="panel schedule-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{isPatient ? 'My Schedule' : 'Front Desk'}</p>
          <h2>{isPatient ? 'Upcoming Appointments' : "Today's Appointment Queue"}</h2>
        </div>
        <button className="secondary-button" type="button">View All</button>
      </div>

      <div className="appointment-list">
        {appointments.map((appointment) => (
          <div className="appointment-row" key={`${appointment.time}-${appointment.patient}`}>
            <time>{appointment.time}</time>
            <div>
              <strong>{appointment.patient}</strong>
              <span>{appointment.type} with {appointment.doctor}</span>
            </div>
            <span className="status-chip">{appointment.status}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export default AppointmentPanel

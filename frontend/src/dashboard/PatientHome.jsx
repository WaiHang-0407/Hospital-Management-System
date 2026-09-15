const services = [
  {
    title: 'Primary Care',
    detail: 'Daily consultations, preventive screening, and follow-up visits for everyday health needs.',
  },
  {
    title: 'Specialist Clinics',
    detail: 'Coordinated care across cardiology, pediatrics, dermatology, orthopedics, and general medicine.',
  },
  {
    title: 'Patient Support',
    detail: 'Clear appointment guidance, billing help, and care coordination from registration to discharge.',
  },
]

const careHighlights = [
  'Same-day triage for urgent symptoms',
  'Digital appointment requests',
  'Secure patient records',
  'Coordinated doctor referrals',
]

function PatientHome({ fullName, onBookAppointment }) {
  return (
    <section className="patient-home">
      <article className="patient-hero">
        <div className="patient-hero-copy">
          <p className="eyebrow">Aurora Medical Centre</p>
          <h2>Compassionate care for every stage of your health journey.</h2>
          <p>
            Welcome{fullName ? `, ${fullName}` : ''}. Our care team brings together modern
            outpatient services, specialist consultations, and patient-first support in one
            calm, connected medical centre.
          </p>
          <div className="patient-hero-actions">
            <button type="button" onClick={onBookAppointment}>Book Appointment</button>
            <a href="tel:+60300000000">Call Reception</a>
          </div>
        </div>
      </article>

      <section className="patient-info-grid">
        <article className="patient-welcome-panel">
          <p className="eyebrow">About Us</p>
          <h2>Your neighbourhood healthcare partner</h2>
          <p>
            Aurora Medical Centre is designed around simple access to care. Patients can
            request appointments, choose a department, and keep their visit information in
            one place while our staff coordinate the clinical workflow behind the scenes.
          </p>
        </article>

        <article className="patient-contact-panel">
          <p className="eyebrow">Visit Information</p>
          <h2>Open Daily</h2>
          <div>
            <strong>8:00 AM - 8:00 PM</strong>
            <span>Outpatient registration and consultation desk</span>
          </div>
          <div>
            <strong>Emergency Support</strong>
            <span>Proceed to reception for urgent triage assistance.</span>
          </div>
        </article>
      </section>

      <section className="patient-service-grid">
        {services.map((service) => (
          <article className="patient-service-card" key={service.title}>
            <strong>{service.title}</strong>
            <span>{service.detail}</span>
          </article>
        ))}
      </section>

      <article className="patient-care-strip">
        <div>
          <p className="eyebrow">Patient Experience</p>
          <h2>Care that feels easier to navigate</h2>
        </div>
        <ul>
          {careHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}

export default PatientHome

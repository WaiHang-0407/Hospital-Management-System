function PatientSignupForm({
  form,
  isSubmitting,
  message,
  onChange,
  onSubmit,
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div>
        <p className="eyebrow">New Patient</p>
        <h2>Create patient account</h2>
      </div>

      <div className="form-grid">
        <label>
          Full Name
          <input
            autoComplete="name"
            name="fullName"
            onChange={onChange}
            required
            value={form.fullName}
          />
        </label>

        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={onChange}
            required
            type="email"
            value={form.email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="new-password"
            minLength="8"
            name="password"
            onChange={onChange}
            required
            type="password"
            value={form.password}
          />
        </label>

        <label>
          Phone
          <input
            autoComplete="tel"
            name="phone"
            onChange={onChange}
            value={form.phone}
          />
        </label>

        <label>
          Date of Birth
          <input
            name="dateOfBirth"
            onChange={onChange}
            type="date"
            value={form.dateOfBirth}
          />
        </label>

        <label>
          Gender
          <select name="gender" onChange={onChange} value={form.gender}>
            <option value="">Select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Blood Type
          <select name="bloodType" onChange={onChange} value={form.bloodType}>
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </label>

        <label>
          Emergency Contact
          <input
            name="emergencyContact"
            onChange={onChange}
            value={form.emergencyContact}
          />
        </label>
      </div>

      <label>
        Address
        <textarea
          name="address"
          onChange={onChange}
          rows="3"
          value={form.address}
        />
      </label>

      {message && <p className="form-message">{message}</p>}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating account...' : 'Create Patient Account'}
      </button>
    </form>
  )
}

export default PatientSignupForm

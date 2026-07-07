function LoginForm({
  form,
  isSubmitting,
  message,
  onChange,
  onSubmit,
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div>
        <p className="eyebrow">Welcome Back</p>
        <h2>Login to your account</h2>
      </div>

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
          autoComplete="current-password"
          minLength="8"
          name="password"
          onChange={onChange}
          required
          type="password"
          value={form.password}
        />
      </label>

      {message && <p className="form-message">{message}</p>}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm

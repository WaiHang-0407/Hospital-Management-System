function Brand({ subtitle = 'Hospital Management System', className = '' }) {
  return (
    <div className={`brand ${className}`.trim()}>
      <span className="brand-mark">H</span>
      <div>
        <strong>Aurora Medical Centre</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  )
}

export default Brand

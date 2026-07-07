function StatGrid({ stats }) {
  return (
    <section className="stats-grid" aria-label="Dashboard summary">
      {stats.map((item) => (
        <article className="stat-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.change}</small>
        </article>
      ))}
    </section>
  )
}

export default StatGrid

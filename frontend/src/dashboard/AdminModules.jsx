import { adminModules } from './data'

function AdminModules() {
  return (
    <article className="panel admin-modules">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Management Modules</h2>
        </div>
      </div>

      <div className="admin-module-grid">
        {adminModules.map((module) => (
          <button className="admin-module-card" key={module.name} type="button">
            <strong>{module.name}</strong>
            <span>{module.detail}</span>
          </button>
        ))}
      </div>
    </article>
  )
}

export default AdminModules

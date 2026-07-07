import { departments } from './data'

function DepartmentPanel({ isPatient }) {
  return (
    <article className="panel departments-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{isPatient ? 'Care Team' : 'Capacity'}</p>
          <h2>{isPatient ? 'Available Services' : 'Department Status'}</h2>
        </div>
      </div>

      <div className="department-list">
        {departments.map((department) => (
          <div className="department-row" key={department.name}>
            <div>
              <strong>{department.name}</strong>
              <span>{department.beds}</span>
            </div>
            <span className={`load-badge ${department.tone}`}>{department.load}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export default DepartmentPanel

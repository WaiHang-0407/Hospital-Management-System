import { adminActivities } from './data'

function AdminActivityPanel() {
  return (
    <article className="panel admin-activity">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Controls</p>
          <h2>Recent Admin Activity</h2>
        </div>
      </div>

      <div className="admin-activity-list">
        {adminActivities.map((activity) => (
          <div className="admin-activity-row" key={activity.title}>
            <div>
              <strong>{activity.title}</strong>
              <span>{activity.detail}</span>
            </div>
            <span className="status-chip">{activity.status}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export default AdminActivityPanel

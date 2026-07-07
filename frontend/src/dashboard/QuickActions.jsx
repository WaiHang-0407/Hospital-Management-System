function QuickActions({ isAdmin, isPatient }) {
  return (
    <article className="panel quick-actions">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Shortcuts</p>
          <h2>Common Tasks</h2>
        </div>
      </div>
      {isAdmin ? (
        <>
          <button type="button">Create Staff User</button>
          <button type="button">Assign Role</button>
          <button type="button">Review Approvals</button>
          <button type="button">Open Audit Logs</button>
        </>
      ) : isPatient ? (
        <>
          <button type="button">Book Appointment</button>
          <button type="button">View Medical Records</button>
          <button type="button">Pay Bill</button>
          <button type="button">Update Profile</button>
        </>
      ) : (
        <>
          <button type="button">Register Patient</button>
          <button type="button">Book Appointment</button>
          <button type="button">Create Invoice</button>
          <button type="button">Update Inventory</button>
        </>
      )}
    </article>
  )
}

export default QuickActions

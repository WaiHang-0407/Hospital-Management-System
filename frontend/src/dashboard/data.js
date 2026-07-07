export const staffStats = [
  { label: 'Patients Today', value: '128', change: '+12%' },
  { label: 'Appointments', value: '46', change: '8 waiting' },
  { label: 'Available Beds', value: '32', change: '74% occupied' },
  { label: 'Open Bills', value: '19', change: 'RM 24.8k' },
]

export const patientStats = [
  { label: 'Upcoming Visits', value: '2', change: 'Next: Jul 4' },
  { label: 'Prescriptions', value: '3', change: '1 refill soon' },
  { label: 'Invoices', value: '1', change: 'RM 120 due' },
  { label: 'Messages', value: '4', change: '2 unread' },
]

export const adminStats = [
  { label: 'Active Users', value: '248', change: '18 staff online' },
  { label: 'Pending Approvals', value: '7', change: '3 urgent' },
  { label: 'Departments', value: '12', change: 'All operational' },
  { label: 'System Alerts', value: '2', change: 'Review today' },
]

export const staffAppointments = [
  {
    time: '09:30',
    patient: 'Aisyah Rahman',
    doctor: 'Dr. Lim',
    type: 'Cardiology',
    status: 'Checked in',
  },
  {
    time: '10:00',
    patient: 'Daniel Wong',
    doctor: 'Dr. Kumar',
    type: 'General',
    status: 'Waiting',
  },
  {
    time: '10:20',
    patient: 'Nur Farah',
    doctor: 'Dr. Tan',
    type: 'Pediatrics',
    status: 'In room',
  },
  {
    time: '11:00',
    patient: 'Michael Lee',
    doctor: 'Dr. Siti',
    type: 'Orthopedics',
    status: 'Scheduled',
  },
]

export const patientAppointments = [
  {
    time: 'Jul 4',
    patient: 'Annual Checkup',
    doctor: 'Dr. Kumar',
    type: 'General Consultation',
    status: 'Confirmed',
  },
  {
    time: 'Jul 18',
    patient: 'Blood Test Review',
    doctor: 'Dr. Lim',
    type: 'Lab Follow-up',
    status: 'Scheduled',
  },
]

export const departments = [
  { name: 'Emergency', load: 'High', beds: '6 beds', tone: 'urgent' },
  { name: 'Outpatient', load: 'Steady', beds: '14 rooms', tone: 'stable' },
  { name: 'Pharmacy', load: 'Normal', beds: '3 pending', tone: 'normal' },
]

export const adminActivities = [
  {
    title: 'New doctor account pending approval',
    detail: 'Dr. Hana Lee requested access to Cardiology tools',
    status: 'Review',
  },
  {
    title: 'Billing permission updated',
    detail: 'Accountant role can now view payment reports',
    status: 'Updated',
  },
  {
    title: 'Database backup completed',
    detail: 'Supabase scheduled backup finished successfully',
    status: 'Healthy',
  },
]

export const adminModules = [
  { name: 'Users & Roles', detail: 'Manage staff, patients, and role access' },
  { name: 'Departments', detail: 'Configure departments, rooms, and capacity' },
  { name: 'Audit Logs', detail: 'Review sensitive activity and login history' },
  { name: 'System Settings', detail: 'Control application-wide preferences' },
]

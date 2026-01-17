import React, { useState, useEffect } from 'react';
import { Users, UserCog, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI, doctorsAPI, appointmentsAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    scheduled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        patientsAPI.getAll(),
        doctorsAPI.getAll(),
        appointmentsAPI.getAll(),
      ]);

      const appointments = appointmentsRes.data.data;
      const scheduledCount = appointments.filter(apt => apt.status === 'scheduled').length;

      setPatientsList(patientsRes.data.data);
      setDoctorsList(doctorsRes.data.data);

      setStats({
        patients: patientsRes.data.data.length,
        doctors: doctorsRes.data.data.length,
        appointments: appointments.length,
        scheduled: scheduledCount,
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.patients,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Doctors',
      value: stats.doctors,
      icon: UserCog,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Appointments',
      value: stats.appointments,
      icon: Calendar,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Scheduled',
      value: stats.scheduled,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        <div className="p-6">
          {recentAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments found</p>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {(() => {
                              const p = patientsList.find(px => px.id === appointment.patient_id);
                              const d = doctorsList.find(dx => dx.id === appointment.doctor_id);
                              const pName = p ? p.name : `Patient #${appointment.patient_id}`;
                              const dName = d ? d.name : `Doctor #${appointment.doctor_id}`;
                              return `${pName} — ${dName}`;
                            })()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.reason || 'No reason specified'}
                          </p>
                        </div>
                      </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Quick Add Patient</h3>
          <p className="text-blue-100 mb-4">Register a new patient in the system</p>
          <button
            onClick={() => navigate('/patients?modal=add')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Add Patient
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Schedule Appointment</h3>
          <p className="text-green-100 mb-4">Book a new appointment quickly</p>
          <button
            onClick={() => navigate('/appointments?modal=add')}
            className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
          >
            Schedule Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">View Reports</h3>
          <p className="text-purple-100 mb-4">Access patient and appointment reports</p>
          <button
            onClick={() => navigate('/appointments')}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import { useState } from 'react';
import { useDesktopStore } from '@/hooks/useDesktopStore';
import { Calendar, Clock, User, Mail, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export function BookingWindow() {
  const { appointments, addAppointment, openWindow, currentUser } = useDesktopStore();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    socialWorker: 'Laura' as 'Laura' | 'John',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({ ...formData, status: 'pending' });
    setStep('success');
  };

  // Get appointments for the logged-in worker
  const myAppointments = currentUser
    ? appointments.filter(a => a.socialWorker === currentUser.name).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    : [];

  return (
    <div className="h-full overflow-auto">
      {step === 'form' ? (
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Book an Appointment</h2>
              <p className="text-white/50 text-sm">Schedule a session with our social workers</p>
            </div>
          </div>

          {/* Worker cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { name: 'Laura' as const, specialty: 'Family Counseling', color: 'from-rose-500 to-rose-700' },
              { name: 'John' as const, specialty: 'Mental Health', color: 'from-sky-500 to-sky-700' },
            ].map(worker => (
              <button
                key={worker.name}
                onClick={() => setFormData({ ...formData, socialWorker: worker.name })}
                className={`p-4 rounded-xl border transition-all ${
                  formData.socialWorker === worker.name
                    ? 'border-teal-400 bg-teal-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${worker.color} flex items-center justify-center text-white font-bold mb-2`}>
                  {worker.name[0]}
                </div>
                <div className="text-white font-semibold text-sm">{worker.name}</div>
                <div className="text-white/50 text-xs">{worker.specialty}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors text-sm"
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400 transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  Time
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400 transition-colors text-sm"
                >
                  {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(t => (
                    <option key={t} value={t} className="bg-[#0f1923]">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors text-sm h-20 resize-none"
                placeholder="Tell us what you'd like to discuss..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              Book Appointment
            </button>
          </form>

          {/* My Appointments (for logged in workers) */}
          {currentUser && myAppointments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                My Upcoming Appointments
              </h3>
              <div className="space-y-2">
                {myAppointments.slice(0, 5).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex flex-col items-center justify-center">
                      <span className="text-teal-400 text-xs font-bold">{format(new Date(appt.date), 'MMM')}</span>
                      <span className="text-white text-sm font-bold leading-none">{format(new Date(appt.date), 'd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{appt.clientName}</div>
                      <div className="text-white/50 text-xs">{appt.time} - {appt.notes}</div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      appt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      appt.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {appt.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All upcoming appointments */}
          {!currentUser && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-3">Upcoming Appointments</h3>
              <div className="space-y-2">
                {appointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex flex-col items-center justify-center">
                      <span className="text-teal-400 text-xs font-bold">{format(new Date(appt.date), 'MMM')}</span>
                      <span className="text-white text-sm font-bold leading-none">{format(new Date(appt.date), 'd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{appt.clientName}</div>
                      <div className="text-white/50 text-xs">{appt.time} with {appt.socialWorker}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="bg-teal-500/20 rounded-full p-4 mb-4">
            <CheckCircle className="w-12 h-12 text-teal-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Appointment Booked!</h3>
          <p className="text-white/60 text-center text-sm mb-2">
            Your appointment with {formData.socialWorker} on {format(new Date(formData.date), 'MMMM d, yyyy')} at {formData.time} has been scheduled.
          </p>
          <p className="text-white/40 text-center text-xs mb-6">
            A confirmation email will be sent to {formData.clientEmail}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep('form');
                setFormData({
                  clientName: '',
                  clientEmail: '',
                  socialWorker: 'Laura',
                  date: format(new Date(), 'yyyy-MM-dd'),
                  time: '10:00',
                  notes: '',
                });
              }}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Book Another
            </button>
            <button
              onClick={() => {
                const worker = formData.socialWorker;
                openWindow('socialWorker', worker, { workerName: worker });
              }}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Message {formData.socialWorker}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

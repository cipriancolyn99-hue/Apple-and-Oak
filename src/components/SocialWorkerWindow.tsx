import { useState } from 'react';
import { useDesktopStore } from '@/hooks/useDesktopStore';
import { useWorkers, useUpdateWorkerProfile, useWorkerSessions } from '@/hooks/useApi';
import { Send, Calendar, Mail, Star, MessageSquare, Save, Pencil, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface SocialWorkerWindowProps {
  workerName: 'Laura' | 'John';
}

const defaultData = {
  Laura: {
    fullName: 'Laura',
    title: 'Family Counselor',
    email: 'lauraappleandoak@gmail.com',
    specialties: ['Family Counseling', 'Child Support', 'Parenting Guidance'],
    bio: 'Laura supports families through challenging times. She specializes in creating safe spaces for open communication and growth.',
    color: 'from-rose-500 to-rose-700',
  },
  John: {
    fullName: 'John',
    title: 'Mental Health Specialist',
    email: 'johnappleandoak@gmail.com',
    specialties: ['Mental Health', 'Community Support', 'Crisis Intervention'],
    bio: 'John provides accessible mental health support with evidence-based practices and genuine compassion.',
    color: 'from-sky-500 to-sky-700',
  },
};

interface Message {
  id: string;
  sender: 'user' | 'worker';
  content: string;
  timestamp: Date;
}

export function SocialWorkerWindow({ workerName }: SocialWorkerWindowProps) {
  const { openWindow, windows, restoreWindow, appointments, currentUser } = useDesktopStore();
  const { data: workersList } = useWorkers();
  const updateProfile = useUpdateWorkerProfile();
  const defaults = defaultData[workerName];

  // Find the real worker record from API
  const apiWorker = workersList?.find(
    (w) => w.name.toLowerCase() === workerName.toLowerCase()
  );

  // Real online status based on active login sessions
  const { data: sessionData } = useWorkerSessions();
  const onlineEmails = new Set(sessionData?.onlineEmails.map((e: string) => e.toLowerCase()) || []);
  const isOnline = apiWorker ? onlineEmails.has(apiWorker.email.toLowerCase()) : false;

  // Use API data if available, else defaults
  const worker = {
    fullName: apiWorker?.name || defaults.fullName,
    title: apiWorker?.title || defaults.title,
    email: apiWorker?.email || defaults.email,
    bio: apiWorker?.bio || defaults.bio,
    specialties: (apiWorker?.specialties
      ? apiWorker.specialties.split(',').map((s) => s.trim()).filter(Boolean)
      : defaults.specialties),
    color: defaults.color,
  };

  // Can this logged-in user edit this profile?
  const canEdit =
    currentUser &&
    (currentUser.name.toLowerCase() === workerName.toLowerCase() ||
      currentUser.email === worker.email);

  const [activeTab, setActiveTab] = useState<'profile' | 'message' | 'book' | 'edit'>('profile');
  const [saved, setSaved] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(worker.title);
  const [editBio, setEditBio] = useState(worker.bio);
  const [editSpecialties, setEditSpecialties] = useState(worker.specialties.join(', '));

  const handleSaveProfile = async () => {
    if (!apiWorker) return;
    await updateProfile.mutateAsync({
      id: apiWorker.id,
      title: editTitle,
      bio: editBio,
      specialties: editSpecialties,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'worker',
      content: `Hello! I'm ${workerName}. How can I help you today? Feel free to ask anything or book an appointment if you'd like to talk in detail.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const workerAppointments = appointments
    .filter((a) => a.socialWorker === workerName)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  const nextAppt = workerAppointments[0];

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, sender: 'user', content: input.trim(), timestamp: new Date() }]);
    setInput('');
    setTimeout(() => {
      const responses = [
        `Thank you for reaching out. I'd be happy to help. Would you like to schedule a session?`,
        `I understand. You're not alone in this.`,
        `That sounds challenging. I'm here to support you.`,
        `I appreciate you sharing that. Let's work together on this.`,
      ];
      setMessages((prev) => [...prev, { id: `msg-${Date.now() + 1}`, sender: 'worker', content: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date() }]);
    }, 1500);
  };

  // Start a voice call with this worker — opens a dedicated call window
  const handleStartCall = () => {
    const existing = windows.find(
      (w) => w.type === 'voiceCall' && w.data?.workerName === workerName && w.isOpen
    );
    if (existing) {
      if (existing.isMinimized) restoreWindow(existing.id);
      return;
    }
    openWindow('voiceCall', `Voice Call — ${workerName}`, { workerName }, { width: 400, height: 580 });
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: <Star className="w-4 h-4" /> },
    { id: 'message' as const, label: 'Message', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'book' as const, label: 'Book', icon: <Calendar className="w-4 h-4" /> },
    ...(canEdit ? [{ id: 'edit' as const, label: 'Edit My Profile', icon: <Pencil className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${worker.color} p-4`}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold border-2 border-white/30">
            {workerName[0]}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold">{worker.fullName}</h3>
            <p className="text-white/80 text-sm">{worker.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`${isOnline ? 'text-green-300' : 'text-white/60'} text-xs`}>
                {isOnline ? 'Logged in' : 'Not logged in'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nextAppt && (
              <div className="hidden sm:block bg-black/20 rounded-lg px-3 py-1.5 text-right">
                <div className="text-white/60 text-[10px]">Next appointment</div>
                <div className="text-white text-xs font-medium">{nextAppt.time} today</div>
              </div>
            )}
            <button
              onClick={handleStartCall}
              className="flex items-center gap-1.5 bg-green-500/90 hover:bg-green-500 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors shadow-lg"
              title={`Voice call ${workerName}`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'profile' && (
          <div className="p-4 space-y-4">
            <p className="text-white/80 text-sm">{worker.bio}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                <Mail className="w-4 h-4 text-teal-400" />
                <span className="text-white text-sm">{worker.email}</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {worker.specialties.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Upcoming Appointments
              </h4>
              {workerAppointments.length > 0 ? (
                <div className="space-y-2">
                  {workerAppointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex flex-col items-center justify-center">
                        <span className="text-teal-400 text-xs font-bold">{format(new Date(appt.date), 'MMM')}</span>
                        <span className="text-white text-sm font-bold leading-none">{format(new Date(appt.date), 'd')}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{appt.clientName}</div>
                        <div className="text-white/50 text-xs">{appt.time} - {appt.notes}</div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs ${appt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {appt.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No upcoming appointments.</p>
              )}
            </div>

            <button onClick={() => setActiveTab('book')} className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-medium text-sm hover:from-teal-500 hover:to-teal-600 transition-all">
              Book an Appointment
            </button>
          </div>
        )}

        {activeTab === 'message' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-white/10 text-white/90'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-50 mt-1 block">{format(msg.timestamp, 'HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${workerName}...`}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors text-sm"
                />
                <button onClick={handleStartCall} className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors" title={`Voice call ${workerName}`}>
                  <Phone className="w-4 h-4" />
                </button>
                <button onClick={handleSendMessage} disabled={!input.trim()} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg transition-colors" title="Send message">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <div className="p-4 space-y-4">
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
              <Calendar className="w-10 h-10 text-teal-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold">Book with {workerName}</h4>
              <p className="text-white/60 text-sm mt-1">Schedule a session at your preferred time.</p>
            </div>
            <button onClick={() => openWindow('booking', 'Book an Appointment')} className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl font-semibold transition-all">
              Open Booking Form
            </button>
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Today&apos;s Availability</h4>
              <div className="grid grid-cols-3 gap-2">
                {['10:00', '11:30', '14:00', '15:30', '16:30', '17:00'].map((time) => {
                  const isBooked = workerAppointments.some((a) => a.time === time && a.date === format(new Date(), 'yyyy-MM-dd'));
                  return (
                    <button key={time} disabled={isBooked} onClick={() => openWindow('booking', 'Book an Appointment')} className={`py-2 rounded-lg text-sm font-medium transition-colors ${isBooked ? 'bg-red-500/10 text-red-400/50 cursor-not-allowed' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                      {isBooked ? `${time} ✕` : `${time} ✓`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* EDIT MY PROFILE — only visible to the logged-in worker */}
        {activeTab === 'edit' && canEdit && (
          <div className="p-4 space-y-4">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
              <Pencil className="w-6 h-6 text-violet-400 mx-auto mb-1" />
              <p className="text-white/70 text-sm">Edit your public profile — visitors will see this</p>
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1 block">Your Job Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Family Counselor"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1 block">About You (Bio)</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                placeholder="Tell visitors about yourself, your experience..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs mb-1 block">Specialties (separated by commas)</label>
              <input
                type="text"
                value={editSpecialties}
                onChange={(e) => setEditSpecialties(e.target.value)}
                placeholder="e.g. Family Counseling, Child Support, Parenting"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white'}`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Profile Saved!' : updateProfile.isPending ? 'Saving...' : 'Save My Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

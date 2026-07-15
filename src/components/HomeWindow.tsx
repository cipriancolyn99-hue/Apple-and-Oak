import { Heart, HandHeart, BookOpen, Mail, MapPin, Users, TreePine, Lightbulb, Rocket, Megaphone, Globe } from 'lucide-react';
import { useDesktopStore } from '@/hooks/useDesktopStore';

interface HomeWindowProps {
  section?: 'home' | 'mission' | 'howWeHelp' | 'ourStory' | 'contact';
}

export function HomeWindow({ section = 'home' }: HomeWindowProps) {
  const { openWindow, adminContent } = useDesktopStore();

  const activeAnnouncements = adminContent.announcements.filter(a => a.active);

  const renderHome = () => (
    <div className="h-full overflow-auto">
      {/* Hero */}
      <div className="relative h-64 rounded-t-xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/forest-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
          <img src="/assets/logo.png" alt="Apple and Oak" className="w-20 h-20 object-contain mb-3" />
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Apple <span className="text-teal-300">&</span> Oak
          </h1>
          <p className="text-white/80 italic mt-1">{adminContent.tagline}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Announcements */}
        {activeAnnouncements.length > 0 && (
          <div className="space-y-2">
            {activeAnnouncements.map((ann) => (
              <div key={ann.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm">{ann.title}</span>
                </div>
                <p className="text-white/70 text-sm">{ann.content}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-white/80 text-center">
          {adminContent.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => openWindow('mission', 'Our Mission')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
          >
            <Heart className="w-8 h-8 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Our Mission</h3>
            <p className="text-white/50 text-sm mt-1">Everyone needs someone.</p>
          </button>
          <button
            onClick={() => openWindow('howWeHelp', 'How We Help')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
          >
            <HandHeart className="w-8 h-8 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">How We Help</h3>
            <p className="text-white/50 text-sm mt-1">Support in every step.</p>
          </button>
          <button
            onClick={() => openWindow('ourStory', 'Our Story')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
          >
            <BookOpen className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Our Story</h3>
            <p className="text-white/50 text-sm mt-1">The story behind our name.</p>
          </button>
          <button
            onClick={() => openWindow('contact', 'Contact')}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
          >
            <Mail className="w-8 h-8 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold">Contact</h3>
            <p className="text-white/50 text-sm mt-1">Get in touch with us.</p>
          </button>
        </div>

        {/* Bottom trust bar */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
              <Heart className="w-3 h-3 text-teal-400" />
            </div>
            Confidential
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
              <Users className="w-3 h-3 text-teal-400" />
            </div>
            Secure
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
              <Heart className="w-3 h-3 text-teal-400" />
            </div>
            You can trust us
          </div>
        </div>
        <p className="text-center text-white/40 text-sm flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          You are not alone. We are here for you.
        </p>
      </div>
    </div>
  );

  const renderMission = () => (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="text-center">
        <span className="text-teal-400 text-xs uppercase tracking-wider font-semibold">Our Mission</span>
        <h2 className="text-2xl font-bold text-white mt-2" style={{ fontFamily: 'Georgia, serif' }}>
          {adminContent.missionTitle}
        </h2>
      </div>

      <div className="space-y-4 text-white/80">
        {adminContent.missionText.split('\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Heart className="w-6 h-6" />, title: 'Compassion', desc: 'Real support begins with understanding.', color: 'text-rose-400' },
          { icon: <TreePine className="w-6 h-6" />, title: 'Strength', desc: 'Strong roots create lasting futures.', color: 'text-green-400' },
          { icon: <Users className="w-6 h-6" />, title: 'Community', desc: 'Success grows when people help one another.', color: 'text-sky-400' },
          { icon: <Lightbulb className="w-6 h-6" />, title: 'Hope', desc: 'Every new beginning starts with hope.', color: 'text-amber-400' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <div className={`${item.color} mb-2 flex justify-center`}>{item.icon}</div>
            <h3 className="text-white font-semibold text-sm">{item.title}</h3>
            <p className="text-white/50 text-xs mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHowWeHelp = () => (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="text-center">
        <span className="text-teal-400 text-xs uppercase tracking-wider font-semibold">How We Help</span>
        <h2 className="text-2xl font-bold text-white mt-2" style={{ fontFamily: 'Georgia, serif' }}>
          {adminContent.howWeHelpTitle}
        </h2>
      </div>

      <p className="text-white/70 text-center">{adminContent.howWeHelpText}</p>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Users className="w-8 h-8" />, title: 'Families', desc: 'Support that puts people first.', color: 'from-rose-500 to-rose-700' },
          { icon: <Heart className="w-8 h-8" />, title: 'Communities', desc: 'Growing stronger together.', color: 'from-teal-500 to-teal-700' },
          { icon: <Lightbulb className="w-8 h-8" />, title: 'Innovation', desc: 'Using technology to connect people.', color: 'from-amber-500 to-amber-700' },
          { icon: <Rocket className="w-8 h-8" />, title: 'Opportunities', desc: 'Creating better futures.', color: 'from-sky-500 to-sky-700' },
        ].map((item, i) => (
          <div key={i} className="group cursor-pointer">
            <div className={`bg-gradient-to-br ${item.color} rounded-xl p-6 text-center transition-transform group-hover:scale-105`}>
              <div className="text-white mb-3 flex justify-center">{item.icon}</div>
              <h3 className="text-white font-bold">{item.title}</h3>
              <p className="text-white/80 text-sm mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Booking CTA */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
        <p className="text-white mb-3">Need to talk to someone? Our social workers are here to help.</p>
        <button
          onClick={() => openWindow('booking', 'Book an Appointment')}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
        >
          Book an Appointment
        </button>
      </div>
    </div>
  );

  const renderOurStory = () => (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="text-center">
        <span className="text-teal-400 text-xs uppercase tracking-wider font-semibold">Our Story</span>
        <h2 className="text-2xl font-bold text-white mt-2" style={{ fontFamily: 'Georgia, serif' }}>
          {adminContent.ourStoryTitle}
        </h2>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            A
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Apple</h3>
            <p className="text-white/70">A symbol of new beginnings. The apple represents growth, knowledge, and the nurturing care that every family deserves.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
            O
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Oak</h3>
            <p className="text-white/70">A symbol of strength. The oak tree stands tall and provides shelter, just as we aim to provide a strong foundation for those in need.</p>
          </div>
        </div>
      </div>

      <div className="text-white/80 text-center italic">
        "{adminContent.ourStoryText}" 
      </div>

      {/* Apple tree image */}
      <div className="rounded-xl overflow-hidden h-40 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/forest-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] to-transparent" />
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="text-center">
        <span className="text-teal-400 text-xs uppercase tracking-wider font-semibold">Contact</span>
        <h2 className="text-2xl font-bold text-white mt-2" style={{ fontFamily: 'Georgia, serif' }}>
          Get in Touch
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-white/50 text-xs">Email</div>
            <div className="text-white">{adminContent.contactEmail}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-white/50 text-xs">Website</div>
            <div className="text-white">helloappleandoak.com</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-white/50 text-xs">Location</div>
            <div className="text-white">United Kingdom</div>
          </div>
        </div>
      </div>

      {/* Social Workers */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Our Social Workers</h3>
        <div className="space-y-3">
          {[
            { name: 'Laura', email: 'lauraappleandoak@gmail.com' },
            { name: 'John', email: 'johnappleandoak@gmail.com' },
          ].map((worker) => (
            <button
              key={worker.name}
              onClick={() => openWindow('socialWorker', worker.name, { workerName: worker.name })}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                {worker.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{worker.name}</div>
                <div className="text-white/50 text-xs">{worker.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Book button */}
      <button
        onClick={() => openWindow('booking', 'Book an Appointment')}
        className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl font-semibold transition-all"
      >
        Book an Appointment
      </button>
    </div>
  );

  switch (section) {
    case 'mission': return renderMission();
    case 'howWeHelp': return renderHowWeHelp();
    case 'ourStory': return renderOurStory();
    case 'contact': return renderContact();
    default: return renderHome();
  }
}

// Need to import this
import { MessageSquare } from 'lucide-react';

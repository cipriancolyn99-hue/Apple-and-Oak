import { useState } from 'react';
import { useDesktopStore } from '@/hooks/useDesktopStore';
import { Home, Heart, HandHeart, BookOpen, Mail, MessageCircle, MessageSquare, Users, Settings, X, Menu } from 'lucide-react';
import type { WindowData } from '@/types';

interface DesktopIconData {
  id: string;
  label: string;
  type: WindowData['type'];
  icon: React.ReactNode;
  gridPosition: { col: number; row: number };
}

// Public icons - everyone sees these
const desktopIcons: DesktopIconData[] = [
  { id: 'home', label: 'Home', type: 'home', icon: <Home size={28} />, gridPosition: { col: 0, row: 0 } },
  { id: 'mission', label: 'Our Mission', type: 'mission', icon: <Heart size={28} />, gridPosition: { col: 0, row: 1 } },
  { id: 'howWeHelp', label: 'How We Help', type: 'howWeHelp', icon: <HandHeart size={28} />, gridPosition: { col: 0, row: 2 } },
  { id: 'ourStory', label: 'Our Story', type: 'ourStory', icon: <BookOpen size={28} />, gridPosition: { col: 0, row: 3 } },
  { id: 'contact', label: 'Contact', type: 'contact', icon: <Mail size={28} />, gridPosition: { col: 0, row: 4 } },
  { id: 'chatMothers', label: 'Live Chat\n(Mothers)', type: 'chatMothers', icon: <MessageCircle size={28} />, gridPosition: { col: 1, row: 0 } },
  { id: 'chatFathers', label: 'Live Chat\n(Fathers)', type: 'chatFathers', icon: <MessageSquare size={28} />, gridPosition: { col: 1, row: 1 } },
  { id: 'chatPublic', label: 'Public\nLive Chat', type: 'chatPublic', icon: <Users size={28} />, gridPosition: { col: 1, row: 2 } },
];

const adminIcon: DesktopIconData = {
  id: 'admin', label: 'Admin\nPanel', type: 'admin', icon: <Settings size={28} />, gridPosition: { col: 1, row: 3 }
};

export function Desktop() {
  const { openWindow, windows, restoreWindow, currentUser } = useDesktopStore();
  const isStaff = currentUser !== null;
  const [showWorkerChooser, setShowWorkerChooser] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleIconClick = (icon: DesktopIconData) => {
    const existingWindow = windows.find(w => w.type === icon.type && w.isOpen);
    if (existingWindow) {
      if (existingWindow.isMinimized) { restoreWindow(existingWindow.id); }
      return;
    }
    openWindow(icon.type, icon.label.replace('\n', ' '));
    setShowMobileMenu(false);
  };

  const openMission = () => {
    const existing = windows.find(w => w.type === 'home' && w.isOpen);
    if (existing) { if (existing.isMinimized) restoreWindow(existing.id); return; }
    openWindow('home', 'Home');
  };

  const openChat = () => { setShowWorkerChooser(true); };

  const chooseWorker = (name: 'Laura' | 'John') => {
    setShowWorkerChooser(false);
    openWindow('socialWorker', name, { workerName: name });
  };

  const isWindowOpen = (type: WindowData['type']) => windows.some(w => w.type === type && w.isOpen && !w.isMinimized);
  const isWindowMinimized = (type: WindowData['type']) => windows.some(w => w.type === type && w.isOpen && w.isMinimized);

  const renderIcon = (icon: DesktopIconData, isMobile = false) => {
    const isOpen = isWindowOpen(icon.type);
    const isMinimized = isWindowMinimized(icon.type);

    return (
      <div
        key={icon.id}
        className={`
          flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all
          hover:bg-white/20 group pointer-events-auto
          ${isOpen ? 'bg-white/15' : ''}
          ${isMinimized ? 'bg-white/5 opacity-70' : ''}
          ${isMobile ? 'p-3 min-w-[72px]' : 'p-2'}
        `}
        style={!isMobile ? {
          gridColumn: icon.gridPosition.col + 1,
          gridRow: icon.gridPosition.row + 1,
        } : {}}
        onClick={() => handleIconClick(icon)}
      >
        <div className={`
          rounded-xl flex items-center justify-center mb-1.5
          shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all
          ${isMobile ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-12 h-12 lg:w-14 lg:h-14'}
          ${icon.type.startsWith('chat')
            ? 'bg-gradient-to-br from-amber-500/80 to-amber-700/80'
            : icon.type === 'contact'
              ? 'bg-gradient-to-br from-rose-500/80 to-rose-700/80'
              : icon.type === 'admin'
                ? 'bg-gradient-to-br from-violet-500/80 to-violet-700/80'
                : 'bg-gradient-to-br from-teal-500/80 to-teal-700/80'
          }
        `}>
          <span className="text-white [&_svg]:w-5 [&_svg]:h-5 lg:[&_svg]:w-7 lg:[&_svg]:h-7">{icon.icon}</span>
        </div>
        <span className="text-white text-[10px] sm:text-xs font-medium text-center drop-shadow-md whitespace-pre-line leading-tight">
          {icon.label}
        </span>
        {isOpen && <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1 animate-pulse" />}
        {isMinimized && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />}
      </div>
    );
  };

  const allIcons = [...desktopIcons, ...(isStaff ? [adminIcon] : [])];

  return (
    <div className="absolute inset-0 pt-4 pb-24 sm:pb-20 px-4">
      {/* Center Logo & Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none w-full px-4">
        <img
          src="/assets/logo.png"
          alt="Apple and Oak"
          className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-2xl mb-2 sm:mb-4"
        />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
          Apple <span className="text-teal-300">&</span> Oak
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-white/90 mt-1 sm:mt-2 drop-shadow-md italic">
          You don&apos;t have to do it alone.
        </p>
        <p className="text-xs sm:text-sm text-white/70 mt-2 sm:mt-4 max-w-xs sm:max-w-sm lg:max-w-md text-center drop-shadow px-2">
          We are here to support individuals, families and communities through compassion, innovation and opportunity.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 pointer-events-auto">
          <button
            onClick={openMission}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#c4956a] hover:bg-[#b38459] text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Discover Our Mission
          </button>
          <button
            onClick={openChat}
            className="px-5 sm:px-6 py-2 sm:py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30 text-sm sm:text-base"
          >
            Chat With Us
          </button>
        </div>
      </div>

      {/* Desktop Icons Grid — hidden on small screens, shown on md+ */}
      <div
        className="relative h-full pointer-events-none hidden md:block"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 72px)',
          gridTemplateRows: 'repeat(6, 82px)',
          gap: '12px',
        }}
      >
        {desktopIcons.map(icon => renderIcon(icon))}
        {isStaff && renderIcon(adminIcon)}
      </div>

      {/* Mobile Menu Button — visible on small screens only */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden fixed top-4 left-4 z-30 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-2.5 rounded-xl transition-all border border-white/20"
        title="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Icon Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-16 left-4 z-30 bg-[#0f1923]/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3">
          <div className="grid grid-cols-3 gap-2">
            {allIcons.map(icon => renderIcon(icon, true))}
          </div>
        </div>
      )}

      {/* Worker Chooser Modal */}
      {showWorkerChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowWorkerChooser(false)}>
          <div className="bg-[#0f1923] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg">Chat With Us</h2>
                <p className="text-teal-200 text-xs">Choose a social worker to talk to</p>
              </div>
              <button onClick={() => setShowWorkerChooser(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <button
                onClick={() => chooseWorker('Laura')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-lg sm:text-xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                  L
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-semibold text-base sm:text-lg">Laura</div>
                  <div className="text-white/60 text-xs sm:text-sm">Family Counselor</div>
                  <div className="text-white/40 text-[10px] sm:text-xs mt-0.5">Family Counseling · Child Support · Parenting</div>
                </div>
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
              </button>

              <button
                onClick={() => chooseWorker('John')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-400/40 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white text-lg sm:text-xl font-bold shrink-0 group-hover:scale-110 transition-transform">
                  J
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-semibold text-base sm:text-lg">John</div>
                  <div className="text-white/60 text-xs sm:text-sm">Mental Health Specialist</div>
                  <div className="text-white/40 text-[10px] sm:text-xs mt-0.5">Mental Health · Community Support · Crisis</div>
                </div>
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
              </button>

              <p className="text-white/40 text-[10px] sm:text-xs text-center pt-1 sm:pt-2">
                Select a social worker to open their profile, message them, book an appointment, or start a voice call.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

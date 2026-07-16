import { useStore } from "@/hooks/useStore";
import { useWorkers, useAppointments, useWorkerSessions, useVisitorCount } from "@/hooks/useApi";
import { Volume2, VolumeX, Clock, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";

export function Taskbar() {
  const { currentUser, soundEnabled, toggleSound, currentTime, openWindow, windows, restoreWindow } = useStore();
  const { data: workersList } = useWorkers();
  const { data: appointmentsList } = useAppointments();
  const { data: sessionData } = useWorkerSessions();
  // REAL visitor count from API - not fake store number
  const { data: visitorData } = useVisitorCount();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Real online status based on active login sessions
  const onlineEmails = new Set(sessionData?.onlineEmails.map((e: string) => e.toLowerCase()) || []);
  const isWorkerOnline = (workerEmail: string) => onlineEmails.has(workerEmail.toLowerCase());
  // REAL visitor count from API
  const realUserCount = visitorData ?? 0;

  // Sound toggle feedback sounds
  const soundOnRef = useRef<HTMLAudioElement | null>(null);
  const soundOffRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    soundOnRef.current = new Audio("/assets/sound-on.mp3");
    soundOffRef.current = new Audio("/assets/sound-off.mp3");
    soundOnRef.current.volume = 0.5;
    soundOffRef.current.volume = 0.5;
  }, []);

  const handleToggleSound = () => {
    const wasOn = soundEnabled;
    toggleSound();
    // Play feedback sound (use the opposite sound since toggle flips it)
    if (wasOn) {
      // Turning OFF — play off sound
      soundOffRef.current?.play().catch(() => {});
    } else {
      // Turning ON — play on sound
      soundOnRef.current?.play().catch(() => {});
    }
  };

  // Get next appointment for logged-in user
  const getNextAppointment = () => {
    if (!currentUser || !appointmentsList) return null;
    const now = format(new Date(), "yyyy-MM-dd");
    return appointmentsList
      .filter((a) => a.date >= now)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
  };

  const nextAppt = getNextAppointment();

  const handleWorkerClick = (name: "Laura" | "John") => {
    openWindow("socialWorker", name, { workerName: name });
  };

  const handleApptClick = () => {
    openWindow("booking", "Book an Appointment");
  };

  const openStaffPanel = () => {
    const existing = windows.find((w) => w.type === "admin" && w.isOpen);
    if (existing) {
      if (existing.isMinimized) restoreWindow(existing.id);
      return;
    }
    openWindow("admin", "Staff Panel");
  };

  const minimizedWindows = windows.filter((w) => w.isMinimized);
  // Count workers who actually have active login sessions
  const onlineWorkers = workersList?.filter((w) => isWorkerOnline(w.email)) || [];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-[#0a1628]/95 backdrop-blur-md border-t border-white/10 flex items-center px-2 sm:px-4 gap-1.5 sm:gap-3 z-50">
      {/* LIVE Badge — hidden on smallest screens */}
      <div className="hidden sm:flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-400 text-xs font-bold tracking-wider">LIVE</span>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded-lg px-1.5 sm:px-2 py-1 transition-colors" onClick={() => openWindow("home", "Home")}>
        <img src="/assets/logo.png" alt="Apple and Oak" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
        <div className="hidden lg:block">
          <div className="text-white text-sm font-semibold leading-tight">Apple and Oak</div>
          <div className="text-white/60 text-[10px] leading-tight">You don&apos;t have to do it alone.</div>
        </div>
      </div>

      <div className="w-px h-8 sm:h-10 bg-white/20 mx-0.5 sm:mx-1" />

      {/* Users Online — compact on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-black/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
        <div>
          <div className="text-green-400 text-sm sm:text-lg font-bold leading-none">{realUserCount}</div>
          <div className="text-white/60 text-[9px] sm:text-[10px] hidden sm:block">Users Online</div>
        </div>
      </div>

      {/* Staff Online — compact on mobile */}
      <div className="hidden sm:flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
        <div className={`w-3 h-3 rounded-full ${onlineWorkers.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
        <div>
          <div className={`text-lg font-bold leading-none ${onlineWorkers.length > 0 ? "text-green-400" : "text-gray-400"}`}>{onlineWorkers.length}</div>
          <div className="text-white/60 text-[10px]">Staff Online</div>
        </div>
      </div>

      <div className="w-px h-8 sm:h-10 bg-white/20 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* Worker list — Laura & John with clear green/red status lights */}
      <div className="hidden md:flex items-center gap-4">
        <div className="text-white/60 text-[10px] uppercase tracking-wider font-semibold mr-1">Social Workers</div>
        {(() => {
          // Always show Laura and John, using API data if available
          const apiWorkers = workersList?.filter((w) => w.name === "Laura" || w.name === "John") || [];
          const laura = apiWorkers.find((w) => w.name === "Laura");
          const john = apiWorkers.find((w) => w.name === "John");
          const workersToShow = [
            laura || { id: 1, name: "Laura", email: "lauraappleandoak@gmail.com", avatar: "L", role: "Social Worker" },
            john || { id: 2, name: "John", email: "johnappleandoak@gmail.com", avatar: "J", role: "Social Worker" },
          ];
          return workersToShow.map((worker) => {
          const online = isWorkerOnline(worker.email);
          return (
            <div
              key={worker.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded-lg px-2.5 py-1.5 transition-colors relative"
              onClick={() => handleWorkerClick(worker.name as "Laura" | "John")}
              onMouseEnter={() => setShowTooltip(String(worker.id))}
              onMouseLeave={() => setShowTooltip(null)}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                  {worker.avatar}
                </div>
                {/* Big bright status light — green when logged in, red when not */}
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0a1628] ${online ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"}`} />
              </div>
              {/* Name */}
              <span className="text-white text-sm font-medium">{worker.name}</span>
              {/* Status badge — bright green or red */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${online ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
                {online ? "ON" : "OFF"}
              </div>
              {showTooltip === String(worker.id) && (
                <div className="absolute bottom-full mb-2 bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50">
                  {online ? `${worker.name} is available — click to chat or call` : `${worker.name} is not available right now`}
                </div>
              )}
            </div>
          );
        });
        })()}
      </div>

      <div className="flex-1" />

      {/* STAFF PANEL - compact on mobile */}
      {currentUser && (
        <>
          <button onClick={openStaffPanel} className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all shadow-lg animate-pulse">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Staff Panel</span>
          </button>
          <div className="w-px h-8 sm:h-10 bg-white/20" />
        </>
      )}

      {/* Minimized Windows */}
      {minimizedWindows.length > 0 && (
        <>
          <div className="hidden lg:flex gap-1">
            {minimizedWindows.map((w) => (
              <button key={w.id} onClick={() => restoreWindow(w.id)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors">
                {w.title}
              </button>
            ))}
          </div>
          <div className="w-px h-10 bg-white/20 hidden lg:block" />
        </>
      )}

      {/* Clock */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-black/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-black/40 transition-colors" onClick={handleApptClick}>
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
        <div className="text-right">
          <div className="text-white text-sm sm:text-lg font-mono font-bold leading-none">{format(currentTime, "HH:mm")}</div>
          {currentUser && nextAppt && (
            <div className="text-amber-400 text-[10px] leading-tight hidden sm:block">Next: {nextAppt.time} with {nextAppt.clientName.split(" ")[0]}</div>
          )}
        </div>
      </div>

      {/* Sound Toggle */}
      <button onClick={handleToggleSound} className="flex items-center gap-1.5 sm:gap-2 bg-black/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-black/40 transition-colors">
        {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
        <span className="text-white/80 text-sm hidden xl:inline">Sound</span>
        <div className={`w-8 sm:w-10 h-4 sm:h-5 rounded-full relative transition-colors ${soundEnabled ? "bg-teal-500" : "bg-gray-600"}`}>
          <div className={`w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-white absolute top-0.5 transition-all ${soundEnabled ? "left-4 sm:left-5" : "left-0.5"}`} />
        </div>
      </button>

      {/* LIVE */}
      <div className="hidden lg:flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-400 text-xs font-bold tracking-wider">LIVE</span>
      </div>
    </div>
  );
}

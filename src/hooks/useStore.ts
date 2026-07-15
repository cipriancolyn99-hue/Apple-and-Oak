import { create } from "zustand";
import type { WindowData, ChatMessage, Appointment, Announcement, Member, UploadedFile } from "@/types";

interface AppState {
  // Windows
  windows: WindowData[];
  activeWindowId: string | null;
  highestZIndex: number;
  openWindow: (type: WindowData["type"], title: string, data?: Record<string, unknown>, size?: { width: number; height: number }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;

  // Auth (staff)
  currentUser: { name: string; email: string; role: string } | null;
  setUser: (user: { name: string; email: string; role: string } | null) => void;

  // Visitor account
  visitorAccount: { id: number; name: string; email: string } | null;
  setVisitorAccount: (user: { id: number; name: string; email: string } | null) => void;

  // Sound
  soundEnabled: boolean;
  toggleSound: () => void;

  // Time
  currentTime: Date;
  updateTime: () => void;

  // Online counts
  usersOnline: number;
  setUsersOnline: (count: number) => void;
  sessionId: string;
  setSessionId: (id: string) => void;

  // Local data (used by components until API takes over)
  messages: ChatMessage[];
  sendMessage: (room: "mothers" | "fathers" | "public", content: string, userName: string) => void;
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, "id" | "createdAt">) => void;
  members: Member[];
  uploadedFiles: UploadedFile[];
  adminContent: {
    tagline: string;
    description: string;
    missionTitle: string;
    missionText: string;
    howWeHelpTitle: string;
    howWeHelpText: string;
    ourStoryTitle: string;
    ourStoryText: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    announcements: Announcement[];
  };
}

const initialMessages: ChatMessage[] = [
  { id: "1", userId: "u1", userName: "Sarah M.", avatar: "SM", content: "Hello everyone! This space is so calming.", timestamp: new Date(Date.now() - 3600000), room: "mothers" },
  { id: "2", userId: "u2", userName: "Emma T.", avatar: "ET", content: "Hi Sarah! Yes, the forest background is beautiful.", timestamp: new Date(Date.now() - 3500000), room: "mothers" },
  { id: "3", userId: "u3", userName: "Mike R.", avatar: "MR", content: "Hey dads! Just wanted to check in.", timestamp: new Date(Date.now() - 7200000), room: "fathers" },
  { id: "4", userId: "u4", userName: "David K.", avatar: "DK", content: "Absolutely Mike. It helps to have a space to talk openly.", timestamp: new Date(Date.now() - 7100000), room: "fathers" },
  { id: "5", userId: "u5", userName: "Jessica L.", avatar: "JL", content: "Welcome to the public chat! This is a safe space for everyone.", timestamp: new Date(Date.now() - 1800000), room: "public" },
  { id: "6", userId: "u6", userName: "Tom H.", avatar: "TH", content: "Thank you for creating this community. Apple and Oak is wonderful!", timestamp: new Date(Date.now() - 1700000), room: "public" },
];

const initialAppointments: Appointment[] = [
  { id: "appt1", clientName: "Maria Gonzalez", clientEmail: "maria@email.com", socialWorker: "Laura", date: "2026-07-15", time: "14:30", status: "confirmed", notes: "Family counseling", createdAt: new Date() },
  { id: "appt2", clientName: "James Wilson", clientEmail: "james@email.com", socialWorker: "John", date: "2026-07-15", time: "16:00", status: "confirmed", notes: "Initial consultation", createdAt: new Date() },
  { id: "appt3", clientName: "Anna Smith", clientEmail: "anna@email.com", socialWorker: "Laura", date: "2026-07-16", time: "10:00", status: "pending", notes: "Follow-up", createdAt: new Date() },
];

export const useStore = create<AppState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  highestZIndex: 100,

  openWindow: (type, title, data, size) => {
    const state = get();
    // SECURITY: Staff Panel is confidential — only staff can open it
    if (type === "admin" && !state.currentUser) return;
    if (!data) {
      const existing = state.windows.find((w) => w.type === type && w.isOpen);
      if (existing) {
        if (existing.isMinimized) {
          set({
            windows: state.windows.map((w) =>
              w.id === existing.id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 } : w
            ),
            highestZIndex: state.highestZIndex + 1,
          });
        }
        return;
      }
    }
    const newWindow: WindowData = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type,
      title,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: state.highestZIndex + 1,
      position: { x: 100 + (state.windows.length % 5) * 40, y: 50 + (state.windows.length % 3) * 40 },
      size: size || { width: 700, height: 500 },
      data,
    };
    set({ windows: [...state.windows, newWindow], highestZIndex: state.highestZIndex + 1 });
  },

  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  minimizeWindow: (id) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)) })),

  restoreWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 } : w
      ),
      highestZIndex: state.highestZIndex + 1,
    });
  },

  focusWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map((w) => (w.id === id ? { ...w, zIndex: state.highestZIndex + 1 } : w)),
      highestZIndex: state.highestZIndex + 1,
      activeWindowId: id,
    });
  },

  updateWindowPosition: (id, position) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, position } : w)) })),

  updateWindowSize: (id, size) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, size } : w)) })),

  currentUser: null,
  setUser: (user) =>
    set((s) => ({
      currentUser: user,
      // When staff logs out, close any confidential Staff Panel windows
      windows: user ? s.windows : s.windows.filter((w) => w.type !== "admin"),
    })),

  visitorAccount: null,
  setVisitorAccount: (user) => set({ visitorAccount: user }),

  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  currentTime: new Date(),
  updateTime: () => set({ currentTime: new Date() }),

  usersOnline: 0,
  setUsersOnline: (count) => set({ usersOnline: count }),
  sessionId: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  setSessionId: (id) => set({ sessionId: id }),

  messages: initialMessages,
  sendMessage: (room, content, userName) =>
    set((s) => ({
      messages: [...s.messages, { id: `msg-${Date.now()}`, userId: "visitor", userName, avatar: userName.substring(0, 2).toUpperCase(), content, timestamp: new Date(), room }],
    })),

  appointments: initialAppointments,
  addAppointment: (appt) =>
    set((s) => ({ appointments: [...s.appointments, { ...appt, id: `appt-${Date.now()}`, createdAt: new Date() }] })),

  members: [
    { id: "m1", name: "Laura", email: "lauraappleandoak@gmail.com", password: "password", role: "Social Worker", joinedAt: "2026-01-15" },
    { id: "m2", name: "John", email: "johnappleandoak@gmail.com", password: "password", role: "Social Worker", joinedAt: "2026-01-15" },
  ],

  uploadedFiles: [
    { id: "f1", name: "Welcome-Guide.pdf", size: "2.4 MB", type: "pdf", url: "#", uploadedAt: "2026-07-10" },
  ],

  adminContent: {
    tagline: "You don't have to do it alone.",
    description: "We are here to support individuals, families and communities through compassion, innovation and opportunity.",
    missionTitle: "Everyone needs someone.",
    missionText: "Life isn't meant to be faced alone. Whether you're building a dream, raising a family, starting a business, or searching for guidance, every journey becomes easier when someone walks beside you.",
    howWeHelpTitle: "Support in every step of life.",
    howWeHelpText: "We provide comprehensive support services for families, communities, and individuals. Our programs focus on building strong foundations through compassion and innovation.",
    ourStoryTitle: "The story behind our name.",
    ourStoryText: "Apple. A symbol of new beginnings. Oak. A symbol of strength. Together they remind us that ideas grow best when supported by strong foundations.",
    contactEmail: "helloappleandoak@gmail.com",
    contactPhone: "",
    contactAddress: "United Kingdom",
    announcements: [
      { id: "ann-1", title: "Welcome to Apple & Oak!", content: "We are excited to launch our new online community.", date: "2026-07-14", active: true },
    ],
  },
}));

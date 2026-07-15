export interface WindowData {
  id: string;
  title: string;
  type: 'home' | 'mission' | 'howWeHelp' | 'ourStory' | 'contact' | 'chatMothers' | 'chatFathers' | 'chatPublic' | 'booking' | 'socialWorker' | 'admin' | 'voiceCall';
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: Record<string, unknown>;
}

export interface DesktopIcon {
  id: string;
  label: string;
  type: WindowData['type'];
  icon: string;
  position: { x: number; y: number };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  timestamp: Date;
  room: 'mothers' | 'fathers' | 'public';
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  socialWorker: 'Laura' | 'John';
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  notes: string;
  createdAt: Date;
}

export interface SocialWorker {
  id: string;
  name: 'Laura' | 'John';
  email: string;
  avatar: string;
  isOnline: boolean;
  isLive: boolean;
  specialties: string[];
  nextAppointment?: Appointment;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'visitor' | 'laura' | 'john';
  avatar?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  joinedAt: string;
}

export interface AdminContent {
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
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

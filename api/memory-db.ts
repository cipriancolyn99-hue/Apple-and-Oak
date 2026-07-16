// Pure in-memory database - no external dependencies
export interface Visitor {
  id: number;
  sessionId: string;
  userName: string;
  lastSeen: Date;
  isOnline: boolean;
  currentRoom: string;
}

export const memoryDB = {
  users: [] as any[],
  sessions: [] as any[],
  workers: [
    { id: 1, name: "Laura", email: "lauraappleandoak@gmail.com", password: "plain:laura123", role: "Social Worker", avatar: "L", title: "Family Counselor", bio: "Experienced family counselor.", isOnline: false, createdAt: new Date() },
    { id: 2, name: "John", email: "johnappleandoak@gmail.com", password: "plain:john123", role: "Social Worker", avatar: "J", title: "Mental Health Specialist", bio: "Mental health specialist.", isOnline: false, createdAt: new Date() },
    { id: 3, name: "Admin", email: "admin@appleandoak.com", password: "plain:admin123", role: "Admin", avatar: "A", title: "Administrator", bio: "Site admin.", isOnline: false, createdAt: new Date() },
  ],
  appointments: [] as any[],
  chatMessages: [] as any[],
  announcements: [] as any[],
  siteFiles: [] as any[],
  siteContent: [] as any[],
  visitors: [] as Visitor[],
  nextId: 1,
};

export function getNextId() {
  return memoryDB.nextId++;
}

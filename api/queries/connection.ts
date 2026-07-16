// Simple in-memory database - no external DB needed
const memoryDB: Record<string, any[]> = {
  users: [],
  sessions: [],
  workers: [
    { id: 1, name: "Laura", email: "lauraappleandoak@gmail.com", password: "$2a$10$dummyhashforlaura", role: "Social Worker", avatar: "L", title: "Family Counselor", bio: "Experienced family counselor specializing in child welfare and parenting support.", isOnline: false, isLive: false, specialties: "Family Counseling,Child Support,Parenting", createdAt: new Date() },
    { id: 2, name: "John", email: "johnappleandoak@gmail.com", password: "$2a$10$dummyhashforjohn", role: "Social Worker", avatar: "J", title: "Mental Health Specialist", bio: "Mental health specialist focused on community wellbeing and crisis intervention.", isOnline: false, isLive: false, specialties: "Mental Health,Community Support,Crisis Intervention", createdAt: new Date() },
  ],
  appointments: [],
  chatMessages: [],
  announcements: [],
  siteFiles: [],
  siteContent: [],
  visitors: [],
};

// Fake drizzle interface
const fakeDrizzle = {
  select: () => ({
    from: (table: string) => ({
      where: (cond: any) => ({
        then: (cb: any) => Promise.resolve(cb(memoryDB[table]?.filter((r: any) => {
          if (cond && cond.value !== undefined) {
            return r[cond.column] === cond.value;
          }
          return true;
        }) || [])).
        catch(() => [])
      }),
      then: (cb: any) => Promise.resolve(cb(memoryDB[table] || [])).catch(() => [])
    }),
    then: (cb: any) => Promise.resolve(cb(memoryDB[table] || [])).catch(() => [])
  }),
  insert: (table: string) => ({
    values: (data: any) => ({
      then: (cb: any) => {
        const id = (memoryDB[table]?.length || 0) + 1;
        const record = { id, ...data, createdAt: new Date() };
        if (!memoryDB[table]) memoryDB[table] = [];
        memoryDB[table].push(record);
        return Promise.resolve(cb([{ insertId: id }])).catch(() => [{ insertId: id }])
      },
      catch: () => ({ then: (cb: any) => cb([{ insertId: 1 }]) }),
    }),
    then: () => ({ catch: () => ({}) }),
  }),
  update: (table: string) => ({
    set: (data: any) => ({
      where: (cond: any) => ({
        then: (cb: any) => {
          const rows = memoryDB[table] || [];
          const updated = rows.filter((r: any) => r[cond?.column] === cond?.value);
          updated.forEach((r: any) => Object.assign(r, data));
          return Promise.resolve(cb()).catch(() => {})
        },
        catch: () => ({ then: () => {} }),
      }),
    }),
  }),
  delete: (table: string) => ({
    where: (cond: any) => ({
      then: (cb: any) => {
        if (memoryDB[table]) {
          memoryDB[table] = memoryDB[table].filter((r: any) => r[cond?.column] !== cond?.value);
        }
        return Promise.resolve(cb()).catch(() => {})
      },
      catch: () => ({ then: () => {} }),
    }),
  }),
  execute: (query: any) => Promise.resolve([[]]),
  query: { 
    workers: { findMany: () => Promise.resolve(memoryDB.workers), findFirst: (opts: any) => Promise.resolve(memoryDB.workers.find(w => Object.entries(opts?.where || {}).every(([k, v]) => (w as any)[k] === v))) || null },
    users: { findMany: () => Promise.resolve(memoryDB.users), findFirst: (opts: any) => Promise.resolve(memoryDB.users.find(u => Object.entries(opts?.where || {}).every(([k, v]) => (u as any)[k] === v))) || null },
    sessions: { findMany: () => Promise.resolve(memoryDB.sessions), findFirst: (opts: any) => Promise.resolve(memoryDB.sessions.find(s => Object.entries(opts?.where || {}).every(([k, v]) => (s as any)[k] === v))) || null },
    appointments: { findMany: () => Promise.resolve(memoryDB.appointments) },
    announcements: { findMany: () => Promise.resolve(memoryDB.announcements) },
    files: { findMany: () => Promise.resolve(memoryDB.siteFiles) },
    siteContent: { findMany: () => Promise.resolve(memoryDB.siteContent) },
    chatMessages: { findMany: () => Promise.resolve(memoryDB.chatMessages) },
    visitors: { findMany: () => Promise.resolve(memoryDB.visitors) },
  },
};

export function getDb() {
  return fakeDrizzle as any;
}

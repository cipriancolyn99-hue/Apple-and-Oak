import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  int,
} from "drizzle-orm/mysql-core";

// Social workers / staff members
export const workers = mysqlTable("workers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Staff"),
  title: varchar("title", { length: 100 }).notNull().default(""),
  bio: text("bio"),
  avatar: varchar("avatar", { length: 10 }).notNull(),
  isOnline: boolean("is_online").notNull().default(false),
  isLive: boolean("is_live").notNull().default(false),
  specialties: text("specialties"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Announcements
export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Uploaded files
export const files = mysqlTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Site content (editable)
export const siteContent = mysqlTable("site_content", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Appointments
export const appointments = mysqlTable("appointments", {
  id: serial("id").primaryKey(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  workerId: int("worker_id").notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chat messages
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userName: varchar("user_name", { length: 100 }).notNull(),
  avatar: varchar("avatar", { length: 10 }).notNull(),
  content: text("content").notNull(),
  room: varchar("room", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Session tokens (secure login sessions)
export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  role: varchar("role", { length: 10 }).notNull(), // "staff" | "user"
  refId: int("ref_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Registered users (visitors who create accounts)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 20 }).notNull().default("email"), // email | google
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Visitor presence (real-time user tracking)
export const visitors = mysqlTable("visitors", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  userName: varchar("user_name", { length: 100 }).notNull().default("Guest"),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  isOnline: boolean("is_online").notNull().default(true),
  currentRoom: varchar("current_room", { length: 20 }).default("none"),
});

import { getDb } from "../api/queries/connection";
import { workers, siteContent, announcements, appointments } from "./schema";

async function seed() {
  const db = getDb();

  // Seed workers
  await db.insert(workers).values([
    {
      name: "Laura",
      email: "lauraappleandoak@gmail.com",
      password: "password",
      role: "Social Worker",
      title: "Family Counselor",
      bio: "Laura supports families through challenging times. She specializes in creating safe spaces for open communication and growth.",
      avatar: "L",
      isOnline: false,
      isLive: false,
      specialties: "Family Counseling, Child Support, Parenting Guidance",
    },
    {
      name: "John",
      email: "johnappleandoak@gmail.com",
      password: "password",
      role: "Social Worker",
      title: "Mental Health Specialist",
      bio: "John provides accessible mental health support with evidence-based practices and genuine compassion.",
      avatar: "J",
      isOnline: false,
      isLive: false,
      specialties: "Mental Health, Community Support, Crisis Intervention",
    },
  ]);

  // Seed site content
  await db.insert(siteContent).values([
    { key: "tagline", value: "You don't have to do it alone." },
    { key: "description", value: "We are here to support individuals, families and communities through compassion, innovation and opportunity." },
    { key: "missionTitle", value: "Everyone needs someone." },
    { key: "missionText", value: "Life isn't meant to be faced alone. Whether you're building a dream, raising a family, starting a business, or searching for guidance, every journey becomes easier when someone walks beside you." },
    { key: "howWeHelpTitle", value: "Support in every step of life." },
    { key: "howWeHelpText", value: "We provide comprehensive support services for families, communities, and individuals. Our programs focus on building strong foundations through compassion and innovation." },
    { key: "ourStoryTitle", value: "The story behind our name." },
    { key: "ourStoryText", value: "Apple. A symbol of new beginnings. Oak. A symbol of strength. Together they remind us that ideas grow best when supported by strong foundations." },
    { key: "contactEmail", value: "helloappleandoak@gmail.com" },
    { key: "contactWebsite", value: "helloappleandoak.com" },
    { key: "contactAddress", value: "United Kingdom" },
  ]);

  // Seed announcements
  await db.insert(announcements).values([
    {
      title: "Welcome to Apple & Oak!",
      content: "We are excited to launch our new online community. Join our live chat rooms to connect with other parents and families.",
      date: "2026-07-14",
      active: true,
    },
  ]);

  // Seed appointments
  await db.insert(appointments).values([
    {
      clientName: "Maria Gonzalez",
      clientEmail: "maria@email.com",
      workerId: 1,
      date: "2026-07-15",
      time: "14:30",
      status: "confirmed",
      notes: "Family counseling session",
    },
    {
      clientName: "James Wilson",
      clientEmail: "james@email.com",
      workerId: 2,
      date: "2026-07-15",
      time: "16:00",
      status: "confirmed",
      notes: "Initial consultation",
    },
  ]);

  console.log("Seed complete!");
}

seed().catch(console.error);

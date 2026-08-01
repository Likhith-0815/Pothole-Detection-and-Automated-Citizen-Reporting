import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('citizen'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Incidents / Pothole Road Defects table
export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  incidentId: text('incident_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  locationName: text('location_name').notNull(),
  ward: text('ward').notNull(),
  severity: text('severity').notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  priorityScore: integer('priority_score').default(50),
  confidence: doublePrecision('confidence').default(0.85),
  surfaceAreaM2: doublePrecision('surface_area_m2').default(1.2),
  estimatedDepthCm: doublePrecision('estimated_depth_cm').default(8.5),
  estimatedCostINR: integer('estimated_cost_inr').default(12500),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('REPORTED'), // REPORTED, AI_ANALYZED, DISPATCHED, IN_REPAIR, RESOLVED
  reportedAt: text('reported_at').notNull(),
  assignedCrewId: text('assigned_crew_id'),
  assignedCrewName: text('assigned_crew_name'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Repair Fleet Crews table
export const crews = pgTable('crews', {
  id: serial('id').primaryKey(),
  crewId: text('crew_id').notNull().unique(),
  name: text('name').notNull(),
  leader: text('leader'),
  contact: text('contact'),
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, EN_ROUTE, ON_SITE, MAINTENANCE
  currentLocation: text('current_location'),
  assignedWard: text('assigned_ward').notNull(),
  jobsCompletedToday: integer('jobs_completed_today').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  incidents: many(incidents),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  reporter: one(users, {
    fields: [incidents.userId],
    references: [users.id],
  }),
}));

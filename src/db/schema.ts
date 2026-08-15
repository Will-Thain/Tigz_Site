import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const faqs = pgTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  tags: text("tags").notNull().default(""),
});

export const kits = pgTable("kits", {
  id: text("id").primaryKey(),
  wipe: text("wipe").notNull(),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  vodUrl: text("vod_url"),
  isCurrent: boolean("is_current").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  publishedBy: text("published_by").notNull().default("admin"),
});

export const kitItems = pgTable("kit_items", {
  id: text("id").primaryKey(),
  kitId: text("kit_id").notNull(),
  slot: text("slot").notNull(),
  itemId: text("item_id").notNull(),
  label: text("label").notNull(),
  detail: text("detail").notNull().default(""),
});

export const characterStats = pgTable("character_stats", {
  id: text("id").primaryKey(),
  pmcLevel: integer("pmc_level"),
  pmcKd: text("pmc_kd"),
  scavKd: text("scav_kd"),
  survival: text("survival"),
  hideoutNotes: text("hideout_notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const polls = pgTable("polls", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  closesAt: timestamp("closes_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
});

export const pollOptions = pgTable("poll_options", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull(),
  label: text("label").notNull(),
  votes: integer("votes").notNull().default(0),
});

export const sponsors = pgTable("sponsors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  blurb: text("blurb").notNull().default(""),
  status: text("status").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const pollVotes = pgTable("poll_votes", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull(),
  optionId: text("option_id").notNull(),
  voterKey: text("voter_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("new"),
  emailedAt: timestamp("emailed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const questCache = pgTable("quest_cache", {
  id: text("id").primaryKey(),
  etag: text("etag"),
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});

export const mediaKitSnapshots = pgTable("media_kit_snapshots", {
  id: text("id").primaryKey(),
  followers: integer("followers"),
  ytSubs: integer("yt_subs"),
  liveCcv: integer("live_ccv"),
  avgCcv: integer("avg_ccv"),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
});

export const admins = pgTable("admins", {
  twitchUserId: text("twitch_user_id").primaryKey(),
});

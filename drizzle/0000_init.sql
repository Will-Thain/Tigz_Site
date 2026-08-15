CREATE TABLE "admins" (
	"twitch_user_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"emailed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"pmc_level" integer,
	"pmc_kd" text,
	"scav_kd" text,
	"survival" text,
	"hideout_notes" text,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text NOT NULL,
	"tags" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kit_items" (
	"id" text PRIMARY KEY NOT NULL,
	"kit_id" text NOT NULL,
	"slot" text NOT NULL,
	"item_id" text NOT NULL,
	"label" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kits" (
	"id" text PRIMARY KEY NOT NULL,
	"wipe" text NOT NULL,
	"title" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"vod_url" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"published_by" text DEFAULT 'admin' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_kit_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"followers" integer,
	"yt_subs" integer,
	"live_ccv" integer,
	"avg_ccv" integer,
	"captured_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"label" text NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"option_id" text NOT NULL,
	"voter_key" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"closes_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quest_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"etag" text,
	"payload" jsonb NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"blurb" text DEFAULT '' NOT NULL,
	"status" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "device_link" (
	"id" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"device_name" text,
	"device_status" text NOT NULL,
	"branch_id" text NOT NULL,
	"branch_name" text NOT NULL,
	"branch_address" text,
	"branch_active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"active" boolean NOT NULL,
	"branch_ids" jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_cursor" (
	"module" text PRIMARY KEY NOT NULL,
	"cursor" text,
	"pulled_at" timestamp with time zone NOT NULL
);

CREATE TABLE "daily_puzzles" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_id" integer NOT NULL,
	"puzzle_date" date NOT NULL,
	"puzzle_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"puzzle_id" integer NOT NULL,
	"phone_id" integer NOT NULL,
	"guess_number" integer NOT NULL,
	"feedback" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"puzzle_id" integer NOT NULL,
	"hint_type" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_facts" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_id" integer NOT NULL,
	"fact_text" text NOT NULL,
	"fact_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phones" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(200) NOT NULL,
	"image_path" text NOT NULL,
	"release_year" integer,
	"price_tier" varchar(20),
	"form_factor" varchar(20),
	"difficulty" varchar(10),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"puzzle_id" integer NOT NULL,
	"score" real,
	"guess_count" integer NOT NULL,
	"is_win" boolean NOT NULL,
	"elapsed_seconds" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"last_played_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "daily_puzzles" ADD CONSTRAINT "daily_puzzles_phone_id_phones_id_fk" FOREIGN KEY ("phone_id") REFERENCES "public"."phones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_puzzle_id_daily_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."daily_puzzles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_phone_id_phones_id_fk" FOREIGN KEY ("phone_id") REFERENCES "public"."phones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_puzzle_id_daily_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."daily_puzzles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_facts" ADD CONSTRAINT "phone_facts_phone_id_phones_id_fk" FOREIGN KEY ("phone_id") REFERENCES "public"."phones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_puzzle_id_daily_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."daily_puzzles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_puzzles_date_idx" ON "daily_puzzles" USING btree ("puzzle_date");
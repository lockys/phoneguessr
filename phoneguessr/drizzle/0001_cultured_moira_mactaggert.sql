ALTER TABLE "users" ADD COLUMN "email" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "phones_brand_model_idx" ON "phones" USING btree ("brand","model");--> statement-breakpoint
CREATE UNIQUE INDEX "results_user_puzzle_idx" ON "results" USING btree ("user_id","puzzle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "streaks_user_idx" ON "streaks" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
ALTER TABLE "users" ALTER COLUMN "google_id" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "telegram_id" varchar(50) UNIQUE;

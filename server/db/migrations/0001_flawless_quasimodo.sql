ALTER TABLE `users` ADD `email` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` integer DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
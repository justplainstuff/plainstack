ALTER TABLE `contacts` ADD `double_opt_sent` integer;--> statement-breakpoint
ALTER TABLE `contacts` ADD `double_opt_confirmed` integer;--> statement-breakpoint
ALTER TABLE `contacts` DROP COLUMN `double_opted`;
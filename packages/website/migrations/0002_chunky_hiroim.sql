CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text,
	`created` integer NOT NULL,
	`failed_last` integer,
	`failed_nr` integer,
	`failed_error` text
);
--> statement-breakpoint
ALTER TABLE `contacts` RENAME COLUMN `double_opt_sent` TO `double_opt_in_sent`;--> statement-breakpoint
ALTER TABLE `contacts` RENAME COLUMN `double_opt_confirmed` TO `double_opt_in_confirmed`;
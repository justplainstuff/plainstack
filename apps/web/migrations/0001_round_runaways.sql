CREATE TABLE `contacts` (
	`email` text NOT NULL,
	`created` integer NOT NULL,
	`double_opted` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `users`;
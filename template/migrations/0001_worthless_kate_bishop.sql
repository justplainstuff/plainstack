CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`created` integer NOT NULL,
	`failed_last` integer,
	`failed_nr` integer,
	`failed_error` text
);

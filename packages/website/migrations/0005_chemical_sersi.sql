CREATE TABLE `new_contacts` (
    `id` text PRIMARY KEY NOT NULL,
    `email` text NOT NULL UNIQUE,
    `created` integer NOT NULL,
    `double_opt_in_sent` integer,
    `double_opt_in_confirmed` integer,
    `double_opt_in_token` text NOT NULL
);--> statement-breakpoint
INSERT INTO `new_contacts` (`id`, `email`, `created`, `double_opt_in_sent`, `double_opt_in_confirmed`, `double_opt_in_token`)
SELECT `email`, `email`, `created`, `double_opt_in_sent`, `double_opt_in_confirmed`, `double_opt_in_token`
FROM `contacts`;--> statement-breakpoint
DROP TABLE `contacts`;--> statement-breakpoint
ALTER TABLE `new_contacts` RENAME TO `contacts`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `contacts_email_unique` ON `contacts` (`email`);

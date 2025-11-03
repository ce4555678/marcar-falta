CREATE TABLE `presence` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`status` text NOT NULL,
	`observation` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

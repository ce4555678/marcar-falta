PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_presence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`status` text NOT NULL,
	`observation` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_presence`("id", "date", "status", "observation", "created_at") SELECT "id", "date", "status", "observation", "created_at" FROM `presence`;--> statement-breakpoint
DROP TABLE `presence`;--> statement-breakpoint
ALTER TABLE `__new_presence` RENAME TO `presence`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
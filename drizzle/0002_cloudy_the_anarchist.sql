CREATE TABLE `conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`leadId` int,
	`contactId` int,
	`conversionType` varchar(100) NOT NULL,
	`conversionValue` decimal(10,2),
	`utmSource` varchar(200),
	`utmMedium` varchar(200),
	`utmCampaign` varchar(500),
	`channel` varchar(100),
	`page` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`page` varchar(255) NOT NULL,
	`title` varchar(500),
	`durationMs` bigint DEFAULT 0,
	`scrollDepthPct` int DEFAULT 0,
	`reached25pct` int DEFAULT 0,
	`reached50pct` int DEFAULT 0,
	`reached75pct` int DEFAULT 0,
	`reached100pct` int DEFAULT 0,
	`userAgent` text,
	`ipAddress` varchar(45),
	`enteredAt` timestamp NOT NULL DEFAULT (now()),
	`exitedAt` timestamp,
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`utmSource` varchar(200),
	`utmMedium` varchar(200),
	`utmCampaign` varchar(500),
	`utmTerm` varchar(500),
	`utmContent` varchar(500),
	`channel` varchar(100),
	`referrer` varchar(500),
	`landingPage` varchar(255),
	`userAgent` text,
	`ipAddress` varchar(45),
	`device` varchar(50),
	`browser` varchar(100),
	`os` varchar(100),
	`totalPageViews` int DEFAULT 0,
	`totalDurationMs` bigint DEFAULT 0,
	`bounced` int DEFAULT 0,
	`converted` int DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`page` varchar(255),
	`videoId` varchar(255) NOT NULL,
	`videoTitle` varchar(500),
	`videoDurationMs` bigint DEFAULT 0,
	`reached25pct` int DEFAULT 0,
	`reached50pct` int DEFAULT 0,
	`reached75pct` int DEFAULT 0,
	`reached100pct` int DEFAULT 0,
	`watchTimeMs` bigint DEFAULT 0,
	`utmSource` varchar(200),
	`utmCampaign` varchar(500),
	`userAgent` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `name` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `leads` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `leads` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `leads` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `leads` ADD `state` varchar(50);--> statement-breakpoint
ALTER TABLE `leads` ADD `zipCode` varchar(20);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmSource` varchar(200);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmMedium` varchar(200);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmCampaign` varchar(500);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmTerm` varchar(500);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmContent` varchar(500);--> statement-breakpoint
ALTER TABLE `leads` ADD `channel` varchar(100);--> statement-breakpoint
ALTER TABLE `leads` ADD `sessionId` varchar(100);--> statement-breakpoint
ALTER TABLE `leads` ADD `leadStatus` enum('new','contacted','qualified','converted','lost') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
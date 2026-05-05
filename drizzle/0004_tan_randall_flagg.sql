CREATE TABLE `ad_account_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('google_ads','meta_ads','tiktok_ads') NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`developerToken` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_account_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credentialId` int NOT NULL,
	`campaignId` varchar(255) NOT NULL,
	`campaignName` varchar(500) NOT NULL,
	`platform` enum('google_ads','meta_ads','tiktok_ads') NOT NULL,
	`spend` decimal(12,2) NOT NULL DEFAULT 0,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`conversionValue` decimal(12,2) DEFAULT 0,
	`cpc` decimal(10,4) DEFAULT 0,
	`ctr` decimal(5,2) DEFAULT 0,
	`roas` decimal(10,2) DEFAULT 0,
	`date` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_metrics_id` PRIMARY KEY(`id`)
);

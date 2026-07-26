CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`monthlyLimit` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `budgets_category_unique` UNIQUE(`category`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(500) NOT NULL,
	`merchant` varchar(255),
	`amount` decimal(12,2) NOT NULL,
	`category` varchar(100) NOT NULL DEFAULT 'Outros',
	`paymentMethod` varchar(50) DEFAULT 'Outro',
	`expenseDate` date NOT NULL,
	`notes` text,
	`items` json,
	`receiptImageUrl` varchar(1000),
	`source` enum('manual','photo') NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);

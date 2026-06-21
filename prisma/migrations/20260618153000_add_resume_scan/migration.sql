-- CreateTable
CREATE TABLE `ResumeScan` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileMimeType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `fileData` LONGBLOB NOT NULL,
    `extractedText` LONGTEXT NOT NULL,
    `targetRole` VARCHAR(191) NOT NULL DEFAULT 'Software Engineer Intern',
    `score` INTEGER NOT NULL,
    `verdict` VARCHAR(191) NOT NULL,
    `matchedKeywords` JSON NOT NULL,
    `missingKeywords` JSON NOT NULL,
    `sectionScores` JSON NOT NULL,
    `suggestions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ResumeScan_userId_key`(`userId`),
    INDEX `ResumeScan_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResumeScan` ADD CONSTRAINT `ResumeScan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

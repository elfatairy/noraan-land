/*
  Warnings:

  - You are about to drop the column `time` on the `calendardate` table. All the data in the column will be lost.
  - The values [FULL] on the enum `CalendarDate_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `createdAt` on the `calendardate` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `calendardate` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `createdAt` on the `course` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `course` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `bunnyLink` on the `groupsession` table. All the data in the column will be lost.
  - You are about to drop the column `creditHistoryId` on the `groupsession` table. All the data in the column will be lost.
  - You are about to drop the column `quizzesLink` on the `groupsession` table. All the data in the column will be lost.
  - You are about to drop the column `zoomLink` on the `groupsession` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `groupsession` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `groupsession` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `bunnyLink` on the `individualsession` table. All the data in the column will be lost.
  - You are about to drop the column `creditHistoryId` on the `individualsession` table. All the data in the column will be lost.
  - You are about to drop the column `quizzesLink` on the `individualsession` table. All the data in the column will be lost.
  - You are about to drop the column `userNotes` on the `individualsession` table. All the data in the column will be lost.
  - You are about to drop the column `zoomLink` on the `individualsession` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `individualsession` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(1))`.
  - You are about to alter the column `createdAt` on the `individualsession` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `individualsession` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `token` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `credentials` on the `usercourse` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `usercourse` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `usercourse` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `rate` on the `usersession` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `usersession` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updatedAt` on the `usersession` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the `credithistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchasehistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endDate` to the `CalendarDate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CalendarDate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `IndividualSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availableTime` to the `UserCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionType` to the `UserCourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `credithistory` DROP FOREIGN KEY `CreditHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `groupsession` DROP FOREIGN KEY `GroupSession_creditHistoryId_fkey`;

-- DropForeignKey
ALTER TABLE `individualsession` DROP FOREIGN KEY `IndividualSession_creditHistoryId_fkey`;

-- DropForeignKey
ALTER TABLE `purchasehistory` DROP FOREIGN KEY `PurchaseHistory_creditHistoryId_fkey`;

-- DropForeignKey
ALTER TABLE `purchasehistory` DROP FOREIGN KEY `PurchaseHistory_userId_fkey`;

-- DropIndex
DROP INDEX `GroupSession_creditHistoryId_key` ON `groupsession`;

-- DropIndex
DROP INDEX `IndividualSession_creditHistoryId_key` ON `individualsession`;

-- AlterTable
ALTER TABLE `calendardate` DROP COLUMN `time`,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('AVAILABLE', 'PASSED') NOT NULL DEFAULT 'AVAILABLE',
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `course` ADD COLUMN `groupPrice` DOUBLE NULL,
    ADD COLUMN `individualPrice` DOUBLE NULL,
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `groupsession` DROP COLUMN `bunnyLink`,
    DROP COLUMN `creditHistoryId`,
    DROP COLUMN `quizzesLink`,
    DROP COLUMN `zoomLink`,
    ADD COLUMN `isFree` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `meetingId` BIGINT NULL,
    ADD COLUMN `startedAt` TIMESTAMP NULL,
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `individualsession` DROP COLUMN `bunnyLink`,
    DROP COLUMN `creditHistoryId`,
    DROP COLUMN `quizzesLink`,
    DROP COLUMN `userNotes`,
    DROP COLUMN `zoomLink`,
    ADD COLUMN `description` VARCHAR(1024) NULL,
    ADD COLUMN `isFree` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `meetingId` BIGINT NULL,
    ADD COLUMN `notes` VARCHAR(255) NULL,
    ADD COLUMN `startedAt` TIMESTAMP NULL,
    ADD COLUMN `title` VARCHAR(255) NOT NULL,
    MODIFY `status` ENUM('UPCOMING', 'RUNNING', 'ENDED') NOT NULL DEFAULT 'UPCOMING',
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `token`,
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `usercourse` DROP COLUMN `credentials`,
    ADD COLUMN `availableTime` VARCHAR(255) NOT NULL,
    ADD COLUMN `sessionType` ENUM('INDIVIDUAL', 'GROUP') NOT NULL,
    ADD COLUMN `subscribtionStatus` ENUM('SUBSCRIBED', 'UNSUBSCRIBED') NOT NULL DEFAULT 'UNSUBSCRIBED',
    ADD COLUMN `userNotes` VARCHAR(255) NULL,
    ADD COLUMN `viewedByAdmin` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `usersession` DROP COLUMN `rate`,
    ADD COLUMN `notes` VARCHAR(255) NULL,
    MODIFY `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `credithistory`;

-- DropTable
DROP TABLE `purchasehistory`;

-- CreateTable
CREATE TABLE `Recording` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionType` ENUM('INDIVIDUAL', 'GROUP') NOT NULL,
    `bunnyGuid` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `IndividualSessionid` INTEGER NULL,
    `groupSessionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribtionHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amountPaid` DOUBLE NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `courseId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recording` ADD CONSTRAINT `Recording_IndividualSessionid_fkey` FOREIGN KEY (`IndividualSessionid`) REFERENCES `IndividualSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recording` ADD CONSTRAINT `Recording_groupSessionId_fkey` FOREIGN KEY (`groupSessionId`) REFERENCES `GroupSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscribtionHistory` ADD CONSTRAINT `subscribtionHistory_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscribtionHistory` ADD CONSTRAINT `subscribtionHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

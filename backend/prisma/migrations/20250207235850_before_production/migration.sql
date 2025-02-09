/*
  Warnings:

  - You are about to drop the column `subscribtionStatus` on the `usercourse` table. All the data in the column will be lost.
  - You are about to drop the `subscribtionhistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `subscribtionhistory` DROP FOREIGN KEY `subscribtionHistory_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `subscribtionhistory` DROP FOREIGN KEY `subscribtionHistory_userId_fkey`;

-- AlterTable
ALTER TABLE `calendardate` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `course` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `groupsession` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `startedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `individualsession` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `startedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `quiz` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `recording` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `usercourse` DROP COLUMN `subscribtionStatus`,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `usersession` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `subscribtionhistory`;

-- CreateTable
CREATE TABLE `PaymentDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NULL,
    `paypalGroupPlanId` VARCHAR(191) NULL,
    `paypalIndividualPlanId` VARCHAR(191) NULL,
    `paymobGroupPlanId` INTEGER NULL,
    `paymobIndividualPlanId` INTEGER NULL,

    UNIQUE INDEX `PaymentDetails_courseId_key`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserCourseSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userCourseId` INTEGER NOT NULL,
    `subscriptionStatus` ENUM('SUBSCRIBED', 'UNSUBSCRIBED') NOT NULL DEFAULT 'UNSUBSCRIBED',
    `subscriptionMethod` ENUM('PAYPAL') NULL,
    `paypalSubscriptionId` VARCHAR(191) NULL,
    `paymobSubscriptionId` VARCHAR(191) NULL,

    UNIQUE INDEX `UserCourseSubscription_userCourseId_key`(`userCourseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentDetails` ADD CONSTRAINT `PaymentDetails_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserCourseSubscription` ADD CONSTRAINT `UserCourseSubscription_userCourseId_fkey` FOREIGN KEY (`userCourseId`) REFERENCES `UserCourse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

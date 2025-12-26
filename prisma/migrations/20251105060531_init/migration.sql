-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetExpires" TEXT,
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "refreshTokenExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpires" TIMESTAMP(3);

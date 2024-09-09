-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" STRING;
ALTER TABLE "User" ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);

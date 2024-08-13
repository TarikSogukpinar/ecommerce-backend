-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'GUEST');

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "uuid" STRING NOT NULL,
    "githubId" STRING,
    "provider" STRING,
    "email" STRING NOT NULL,
    "image" STRING,
    "name" STRING,
    "password" STRING NOT NULL,
    "refreshToken" STRING,
    "accessToken" STRING,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

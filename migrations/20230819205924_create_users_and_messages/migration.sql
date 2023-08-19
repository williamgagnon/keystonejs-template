-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT E'user',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "category" TEXT NOT NULL DEFAULT E'access',
    "from" UUID,
    "to" UUID,
    "title" TEXT NOT NULL DEFAULT E'',
    "plain" TEXT NOT NULL DEFAULT E'',
    "rich" JSONB NOT NULL DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]',
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Message_category_idx" ON "Message"("category");

-- CreateIndex
CREATE INDEX "Message_from_idx" ON "Message"("from");

-- CreateIndex
CREATE INDEX "Message_to_idx" ON "Message"("to");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_from_fkey" FOREIGN KEY ("from") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_to_fkey" FOREIGN KEY ("to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

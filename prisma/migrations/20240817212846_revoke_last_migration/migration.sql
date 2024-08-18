-- CreateTable
CREATE TABLE "_TrainningStudents" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TrainningStudents_AB_unique" ON "_TrainningStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_TrainningStudents_B_index" ON "_TrainningStudents"("B");

-- AddForeignKey
ALTER TABLE "_TrainningStudents" ADD CONSTRAINT "_TrainningStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "trainnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainningStudents" ADD CONSTRAINT "_TrainningStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

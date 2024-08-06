-- CreateTable
CREATE TABLE "trainnings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "format" TEXT NOT NULL,
    "duraction" TEXT NOT NULL,
    "timeconclusion" TEXT NOT NULL,
    "intended" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "teacherLink" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "aboutHeader" TEXT,
    "trail" TEXT[],
    "like" BOOLEAN,
    "content" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trainningId" TEXT NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trainningId" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TrainningStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TrainningStudents_AB_unique" ON "_TrainningStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_TrainningStudents_B_index" ON "_TrainningStudents"("B");

-- AddForeignKey
ALTER TABLE "trainnings" ADD CONSTRAINT "trainnings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainningStudents" ADD CONSTRAINT "_TrainningStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "trainnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainningStudents" ADD CONSTRAINT "_TrainningStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

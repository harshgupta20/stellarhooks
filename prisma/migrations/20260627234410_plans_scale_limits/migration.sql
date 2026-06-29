-- AlterEnum
ALTER TYPE "Plan" ADD VALUE 'SCALE';

-- CreateTable
CREATE TABLE "plan_limits" (
    "id" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "resource" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,

    CONSTRAINT "plan_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_limits_plan_resource_key" ON "plan_limits"("plan", "resource");


-- CreateIndex
CREATE INDEX "Job_status_type_experienceLevel_idx" ON "Job"("status", "type", "experienceLevel");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

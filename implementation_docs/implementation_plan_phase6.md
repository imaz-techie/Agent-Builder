# Implementation Plan - Phase 6: Training Pipeline & Fine-Tuning Jobs

This plan details the implementation of **Phase 6 (Model Fine-Tuning Pipeline, Training Jobs Queue, Job Logs, Job Actions like Cancel/Retry, and Dataset Versioning)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Adding `TrainingJob` and `TrainingDataset` models to `server/prisma/schema.prisma`.
> - **Job Statuses**: Enums `QUEUED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`.
> - **Hyperparameters & Metrics**: Epochs, learning rate, batch size, loss curve tracking (`currentEpoch`, `totalEpochs`, `currentLoss`, `progressPercent`).
> - **Dataset Versioning**: Fine-tuning datasets (`TrainingDataset`) with sample count, file size, version numbers (`v1.0`, `v1.1`), and dataset validation.
> - **Frontend Compatibility**: Directly integrates with [TrainingCenterPage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/TrainingCenterPage.tsx) so job queues, live training progress indicators, log stream getters, and retry/cancel actions function cleanly when `VITE_USE_API=true`.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add models & enums:
- `TrainingStatus`: `QUEUED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`.
- `TrainingDataset`: `id`, `name`, `description`, `version`, `sampleCount`, `fileSizeBytes`, `filePath`, `agentId`, `workspaceId`, `createdById`, timestamps.
- `TrainingJob`: `id`, `jobName`, `agentId`, `datasetId`, `status`, `epochs`, `learningRate`, `batchSize`, `currentEpoch`, `totalEpochs`, `progressPercent`, `currentLoss`, `trainingLogs` (string array / JSON), `errorMessage`, `startedAt`, `completedAt`, `workspaceId`, `createdById`, timestamps.

### 2. DTOs & Interfaces (`server/src/interfaces/training.interface.ts`)
- `CreateTrainingDatasetDTO`, `StartTrainingJobDTO`, `TrainingJobQueryParams`, `TrainingJobResponse`, `TrainingDatasetResponse`.

### 3. Validation Schemas (`server/src/validators/training.validator.ts`)
Zod validation schemas for:
- `createDatasetSchema`, `startTrainingJobSchema`, `trainingQuerySchema`.

### 4. Repository Layer (`server/src/repositories/training.repository.ts`)
Database access methods:
- `createDataset`, `findDatasetsByWorkspace`, `createJob`, `findJobById`, `findJobsByWorkspace`, `updateJobProgress`, `updateJobStatus`, `addJobLog`.

### 5. Service Layer (`server/src/services/training.service.ts`)
Business logic:
- `createDataset`: Register a fine-tuning dataset with version tracking.
- `startTrainingJob`: Queue a new fine-tuning job for a target agent and dataset.
- `simulateJobProgress`: Asynchronous task execution updating training epochs, loss metrics, and appending logs to `trainingLogs`.
- `cancelJob`: Transition job state to `CANCELLED` and stop training run.
- `retryJob`: Re-queue a failed/cancelled job as a new training run.
- `getJobLogs`: Retrieve real-time execution logs for a training job.

### 6. Controller & Routes (`server/src/controllers/training.controller.ts` & `server/src/routes/training.routes.ts`)
REST Endpoints:
- `POST /api/v1/workspaces/:workspaceId/training/datasets` -> Create dataset
- `GET /api/v1/workspaces/:workspaceId/training/datasets` -> List workspace datasets
- `POST /api/v1/workspaces/:workspaceId/training/jobs` -> Launch fine-tuning job
- `GET /api/v1/workspaces/:workspaceId/training/jobs` -> List workspace training jobs
- `GET /api/v1/workspaces/:workspaceId/training/jobs/:id` -> Get job status & progress
- `GET /api/v1/workspaces/:workspaceId/training/jobs/:id/logs` -> Fetch job log stream
- `POST /api/v1/workspaces/:workspaceId/training/jobs/:id/cancel` -> Cancel training run
- `POST /api/v1/workspaces/:workspaceId/training/jobs/:id/retry` -> Retry training run

### 7. Tests (`server/tests/training.test.ts`)
Unit & integration tests covering dataset registration, job queuing, progress metrics, log retrieving, and job cancellation.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/training` datasets, job launch, logs, cancel, and retry endpoints.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test creating a fine-tuning dataset, starting a training job, viewing training logs/progress, and cancelling/retrying a job.

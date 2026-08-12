-- AlterTable
ALTER TABLE "chat_widget_configs" ADD COLUMN     "suggestedQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[];

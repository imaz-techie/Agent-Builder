import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { config } from "../config";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Agent Builder REST API Documentation",
      version: "1.0.0",
      description:
        "Comprehensive Clean Architecture REST API backend documentation with full payload schemas and response structures for the Agent Builder AI SaaS Platform.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: "Development Server (API v1 Prefix)",
      },
      {
        url: `http://localhost:${config.port}`,
        description: "Root Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token in the format: Bearer <token>",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation completed successfully" },
            data: { type: "object" },
            meta: { type: "object" },
          },
        },
        ApiErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid request parameters" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email format" },
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "11111111-1111-1111-1111-111111111111" },
            email: { type: "string", format: "email", example: "developer@example.com" },
            name: { type: "string", example: "John Doe" },
            avatarUrl: { type: "string", nullable: true, example: "https://example.com/avatar.png" },
            role: { type: "string", enum: ["ADMIN", "DEVELOPER", "VIEWER", "WORKSPACE_OWNER"], example: "DEVELOPER" },
            isVerified: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Workspace: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "22222222-2222-2222-2222-222222222222" },
            name: { type: "string", example: "Acme AI Labs" },
            slug: { type: "string", example: "acme-ai-labs" },
            logoUrl: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Agent: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "33333333-3333-3333-3333-333333333333" },
            name: { type: "string", example: "Customer Support Bot" },
            description: { type: "string", example: "Automated AI customer support representative" },
            category: { type: "string", example: "Support" },
            tags: { type: "array", items: { type: "string" }, example: ["support", "sales"] },
            status: { type: "string", enum: ["DRAFT", "TRAINING", "ACTIVE", "INACTIVE", "DEPLOYING"], example: "ACTIVE" },
            currentVersion: { type: "string", example: "1.0.0" },
            model: { type: "string", enum: ["GPT_4O", "GPT_4O_MINI", "CLAUDE_3_5_SONNET", "CLAUDE_3_HAIKU", "GEMINI_1_5_PRO", "LLAMA_3_1_70B"], example: "GPT_4O" },
            temperature: { type: "number", example: 0.7 },
            maxTokens: { type: "integer", example: 4096 },
            systemPrompt: { type: "string", example: "You are a helpful AI assistant." },
            avatarColor: { type: "string", example: "#3B82F6" },
            totalChats: { type: "integer", example: 42 },
            lastTrainingAt: { type: "string", format: "date-time", nullable: true },
            workspaceId: { type: "string", format: "uuid" },
            createdById: { type: "string", format: "uuid" },
          },
        },
        KnowledgeFile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Product_Manual.pdf" },
            type: { type: "string", enum: ["PDF", "DOCX", "TXT", "CSV", "JSON", "MARKDOWN", "URL"], example: "PDF" },
            sizeBytes: { type: "string", example: "1048576" },
            status: { type: "string", enum: ["INDEXED", "PROCESSING", "FAILED", "PENDING"], example: "INDEXED" },
            chunksCount: { type: "integer", example: 12 },
            workspaceId: { type: "string", format: "uuid" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

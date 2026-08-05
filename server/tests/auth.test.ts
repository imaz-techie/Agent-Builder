import request from "supertest";
import { createApp } from "../src/app";
import { userRepository } from "../src/repositories/user.repository";
import { authRepository } from "../src/repositories/auth.repository";

// Mock Repositories for offline unit testing
jest.mock("../src/repositories/user.repository");
jest.mock("../src/repositories/auth.repository");

describe("Phase 2 Authentication Endpoints", () => {
  const app = createApp();

  const mockUser = {
    id: "user-uuid-1234",
    email: "test@example.com",
    passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456", // dummy hash
    name: "Auth Test User",
    avatarUrl: null,
    role: "DEVELOPER" as const,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testUser = {
    email: "test@example.com",
    password: "Password123",
    name: "Auth Test User",
  };

  let accessToken = "";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/auth/register should register user and return tokens", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
    (authRepository.createInitialWorkspace as jest.Mock).mockResolvedValue({ id: "ws-1" });
    (authRepository.saveRefreshToken as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.tokens).toHaveProperty("accessToken");
    expect(res.body.data.tokens).toHaveProperty("refreshToken");

    accessToken = res.body.data.tokens.accessToken;
  });

  it("POST /api/v1/auth/register with duplicate email should fail (400)", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/login with invalid credentials should return 401", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "wrong@example.com",
      password: "Password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/auth/me without token should return 401 Unauthorized", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/auth/me with valid Bearer token should return user profile", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(mockUser.email);
  });

  it("POST /api/v1/auth/forgot-password should accept valid email", async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (authRepository.createPasswordResetToken as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: testUser.email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

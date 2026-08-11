import request from "supertest";
import { createApp } from "../src/app";
import { userRepository } from "../src/repositories/user.repository";
import { authRepository } from "../src/repositories/auth.repository";
import { generateTotpSecret, generateTotp } from "../src/utils/totp";

// Mock Repositories for offline unit testing
jest.mock("../src/repositories/user.repository");
jest.mock("../src/repositories/auth.repository");
jest.mock("../src/utils/password");

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
    twoFactorEnabled: false,
    twoFactorSecret: null,
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

  it("PATCH /api/v1/auth/me should update the current user profile", async () => {
    (userRepository.updateProfile as jest.Mock).mockResolvedValue({
      ...mockUser,
      name: "Updated Name",
    });

    const res = await request(app)
      .patch("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe("Updated Name");
  });

  it("POST /api/v1/auth/change-password should reject wrong current password", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    const { comparePassword } = require("../src/utils/password");
    (comparePassword as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentPassword: "WrongPass123!", newPassword: "NewPass456!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/change-password should update password on success", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    const { comparePassword } = require("../src/utils/password");
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (userRepository.updatePassword as jest.Mock).mockResolvedValue(mockUser);
    (authRepository.deleteAllRefreshTokensForUser as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ currentPassword: "Password123", newPassword: "NewPass456!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/v1/auth/2fa/enable should initialize 2FA setup", async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    const { comparePassword } = require("../src/utils/password");
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (userRepository.setTwoFactorSecret as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/v1/auth/2fa/enable")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ password: "Password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("secret");
    expect(res.body.data).toHaveProperty("otpauthUrl");
  });

  it("POST /api/v1/auth/2fa/confirm should enable 2FA with valid code", async () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret);
    (userRepository.findById as jest.Mock).mockResolvedValue({
      ...mockUser,
      twoFactorSecret: secret,
    });
    (userRepository.enableTwoFactor as jest.Mock).mockResolvedValue({
      ...mockUser,
      twoFactorEnabled: true,
    });

    const res = await request(app)
      .post("/api/v1/auth/2fa/confirm")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ totpCode: code });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.twoFactorEnabled).toBe(true);
  });

  it("GET /api/v1/auth/sessions should list active sessions", async () => {
    (authRepository.listSessionsForUser as jest.Mock).mockResolvedValue([
      {
        id: "sess-1",
        ipAddress: "192.168.1.42",
        userAgent: "Mozilla/5.0 (Macintosh)",
        expiresAt: new Date(),
        createdAt: new Date(),
      },
    ]);

    const res = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessions).toHaveLength(1);
    expect(res.body.data.sessions[0]).not.toHaveProperty("token");
  });

  it("DELETE /api/v1/auth/sessions/:id should revoke a session", async () => {
    (authRepository.findSessionById as jest.Mock).mockResolvedValue({ id: "sess-1" });
    (authRepository.deleteSessionById as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .delete("/api/v1/auth/sessions/sess-1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

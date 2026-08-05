import request from "supertest";
import { createApp } from "../src/app";

describe("Health & Version Endpoints", () => {
  const app = createApp();

  it("GET /health should return 200 OK and health status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("status", "healthy");
    expect(res.body.data).toHaveProperty("uptime");
  });

  it("GET /version should return 200 OK and version details", async () => {
    const res = await request(app).get("/version");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("version", "1.0.0");
  });

  it("GET /invalid-route should return 404", async () => {
    const res = await request(app).get("/invalid-route");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
  });
});

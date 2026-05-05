import { describe, it, expect } from "vitest";
import { GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN, META_ADS_ACCESS_TOKEN } from "./_core/env";

describe("API Credentials Validation", () => {
  it("should have Google Ads credentials configured", () => {
    expect(GOOGLE_ADS_DEVELOPER_TOKEN).toBeDefined();
    expect(GOOGLE_ADS_DEVELOPER_TOKEN).not.toBe("");
    expect(GOOGLE_ADS_REFRESH_TOKEN).toBeDefined();
    expect(GOOGLE_ADS_REFRESH_TOKEN).not.toBe("");
  });

  it("should have Meta Ads credentials configured", () => {
    expect(META_ADS_ACCESS_TOKEN).toBeDefined();
    expect(META_ADS_ACCESS_TOKEN).not.toBe("");
  });

  it("should validate Google Ads Developer Token format", () => {
    const devToken = GOOGLE_ADS_DEVELOPER_TOKEN;
    expect(devToken?.length).toBeGreaterThan(10);
  });

  it("should validate Meta Ads Access Token format", () => {
    const accessToken = META_ADS_ACCESS_TOKEN;
    expect(accessToken?.length).toBeGreaterThan(50);
  });

  it("should validate Google Ads Refresh Token format", () => {
    const refreshToken = GOOGLE_ADS_REFRESH_TOKEN;
    expect(refreshToken).toBeDefined();
    expect(refreshToken?.length).toBeGreaterThan(10);
  });
});

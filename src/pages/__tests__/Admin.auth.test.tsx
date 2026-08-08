import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) } },
}));
vi.mock("@/lib/adminDb", async () => {
  const actual = await vi.importActual<typeof import("@/lib/adminDb")>("@/lib/adminDb");
  return {
    ...actual,
    adminDb: {
      select: vi.fn(async () => ({ data: [], error: null })),
      insert: vi.fn(async () => ({ data: [], error: null })),
      update: vi.fn(async () => ({ data: [], error: null })),
      delete: vi.fn(async () => ({ data: true, error: null })),
    },
  };
});

import Admin from "../Admin";

describe("Admin route auth gating", () => {
  beforeEach(() => {
    invoke.mockReset();
    localStorage.clear();
  });
  afterEach(cleanup);

  it("renders the password gate when no token is stored", async () => {
    render(<Admin />);
    expect(await screen.findByPlaceholderText("Enter password")).toBeInTheDocument();
    expect(screen.queryByText(/Contact Forms/i)).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("verifies a stored token server-side and clears it when rejected", async () => {
    localStorage.setItem("aureon_admin_token", "admin.9999999999999.forged");
    invoke.mockResolvedValue({ data: { authenticated: false, role: null }, error: null });
    render(<Admin />);
    await waitFor(() => expect(invoke).toHaveBeenCalledWith("admin-auth", {
      body: { action: "verify", token: "admin.9999999999999.forged" },
    }));
    expect(await screen.findByPlaceholderText("Enter password")).toBeInTheDocument();
    expect(localStorage.getItem("aureon_admin_token")).toBeNull();
  });

  it("renders the dashboard only when the server confirms the admin role", async () => {
    localStorage.setItem("aureon_admin_token", "admin.9999999999999.valid");
    invoke.mockResolvedValue({ data: { authenticated: true, role: "admin" }, error: null });
    render(<Admin />);
    expect(await screen.findByText(/Contact Forms/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Enter password")).not.toBeInTheDocument();
  });

  it("does not trust a non-admin role", async () => {
    localStorage.setItem("aureon_admin_token", "user.9999999999999.sig");
    invoke.mockResolvedValue({ data: { authenticated: true, role: "user" }, error: null });
    render(<Admin />);
    expect(await screen.findByPlaceholderText("Enter password")).toBeInTheDocument();
  });
});

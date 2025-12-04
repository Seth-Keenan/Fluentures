import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const mod = await import("@/tests/mocks/framer-motion");
  return mod;
});

// Mock Supabase client
const mockSupabaseFrom = vi.fn();
const mockSupabaseAuth = vi.fn();

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: () => ({
    from: mockSupabaseFrom,
    auth: {
      getUser: mockSupabaseAuth,
    },
  }),
}));

// Mock fetch for friends API
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock LinkAsButton
vi.mock("@/app/components/LinkAsButton", () => {
  return {
    LinkAsButton: (props: {
      href: string;
      children: React.ReactNode;
      className?: string;
    }) =>
      React.createElement(
        "a",
        { href: props.href, className: props.className },
        props.children
      ),
  };
});

// Mock PageBackground
vi.mock("@/app/components/PageBackground", () => {
  return {
    __esModule: true,
    default: (props: { children: React.ReactNode }) =>
      React.createElement(
        "div",
        { "data-testid": "page-background" },
        props.children
      ),
  };
});

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => React.createElement("span", { "data-testid": "icon" }),
}));

import CommunityPage from "./page";

describe("CommunityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for auth - logged in user
    mockSupabaseAuth.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    // Default mock for posts
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "Post") {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === "Comment") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    // Default mock for friends API
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ friends: [] }),
    });
  });

  // ===================
  // RENDERING TESTS
  // ===================

  it("renders the community page heading", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /community/i })
      ).toBeInTheDocument();
    });
  });

  it("renders description text", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/share progress, connect with friends/i)
      ).toBeInTheDocument();
    });
  });

  it("renders back to home link", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /back to home/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
        "href",
        "/home"
      );
    });
  });

  it("renders page background", () => {
    render(<CommunityPage />);

    expect(screen.getByTestId("page-background")).toBeInTheDocument();
  });

  // ===================
  // TAB NAVIGATION
  // ===================

  it("renders Posts tab as active by default", () => {
    render(<CommunityPage />);

    const postsTab = screen.getByRole("button", { name: /posts/i });
    expect(postsTab).toBeInTheDocument();
    expect(postsTab).toHaveClass("bg-white");
  });

  it("renders Friends tab", () => {
    render(<CommunityPage />);

    expect(screen.getByRole("button", { name: /friends/i })).toBeInTheDocument();
  });

  it("renders Activity tab", () => {
    render(<CommunityPage />);

    expect(screen.getByRole("button", { name: /activity/i })).toBeInTheDocument();
  });

  it("switches to Friends tab when clicked", async () => {
    render(<CommunityPage />);

    const friendsTab = screen.getByRole("button", { name: /friends/i });
    fireEvent.click(friendsTab);

    await waitFor(() => {
      expect(screen.getByText(/add friend/i)).toBeInTheDocument();
    });
  });

  it("switches to Activity tab when clicked", async () => {
    render(<CommunityPage />);

    const activityTab = screen.getByRole("button", { name: /activity/i });
    fireEvent.click(activityTab);

    await waitFor(() => {
      expect(screen.getByText(/template activities/i)).toBeInTheDocument();
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  // ===================
  // POSTS TAB
  // ===================

  it("renders post composer textarea", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/share what you learned/i)
      ).toBeInTheDocument();
    });
  });

  it("renders tags input", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/tags.*comma/i)
      ).toBeInTheDocument();
    });
  });

  it("updates post text when typing", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/share what you learned/i);
      fireEvent.change(textarea, { target: { value: "Hello world" } });
      expect(textarea).toHaveValue("Hello world");
    });
  });

  it("renders filter section", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText(/filters/i)).toBeInTheDocument();
    });
  });

  it("renders filter buttons (All, Liked, Mine)", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /liked/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /mine/i })).toBeInTheDocument();
    });
  });

  it("renders visibility dropdown", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText(/visibility/i)).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  // ===================
  // FRIENDS TAB
  // ===================

  it("renders add friend input on Friends tab", async () => {
    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    });
  });

  it("renders send button on Friends tab", async () => {
    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /send/i })
      ).toBeInTheDocument();
    });
  });

  it("shows pending requests badge when there are pending requests", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("type=pending")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              friends: [
                {
                  friendship_id: "f1",
                  user_id: "user-456",
                  friend_id: "user-123",
                  status: "pending",
                  friendInfo: { user_id: "user-456", social_username: "friend1" },
                  created_at: new Date().toISOString(),
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ friends: [] }),
      });
    });

    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("calls friend request API when sending request", async () => {
    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/enter username/i);
    fireEvent.change(input, { target: { value: "newfriend" } });

    const sendButton = screen.getByRole("button", { name: /^send$/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/friends/send-request",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ friend_username: "newfriend" }),
        })
      );
    });
  });

  it("shows error when sending friend request without username", async () => {
    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^send$/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a username/i)).toBeInTheDocument();
    });
  });

  // ===================
  // ACTIVITY TAB
  // ===================

  it("shows coming soon message on Activity tab", async () => {
    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /activity/i }));

    await waitFor(() => {
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  // ===================
  // FILTER FUNCTIONALITY
  // ===================

  it("changes filter when clicking filter buttons", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /liked/i })).toBeInTheDocument();
    });

    const likedButton = screen.getByRole("button", { name: /liked/i });
    fireEvent.click(likedButton);

    await waitFor(() => {
      expect(likedButton).toHaveClass("bg-indigo-500");
    });
  });

  it("updates search query when typing in search", async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "test query" } });
      expect(searchInput).toHaveValue("test query");
    });
  });

  // ===================
  // MESSAGE DISPLAY
  // ===================

  it("displays success message when friend request sent successfully", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/friends/send-request") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ friends: [] }),
      });
    });

    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/enter username/i);
    fireEvent.change(input, { target: { value: "newfriend" } });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByText(/friend request sent/i)).toBeInTheDocument();
    });
  });

  it("displays error message when friend request fails", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/friends/send-request") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "User not found" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ friends: [] }),
      });
    });

    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/enter username/i);
    fireEvent.change(input, { target: { value: "nonexistent" } });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  // ===================
  // POSTS WITH DATA
  // ===================

  it("displays posts when loaded", async () => {
    const mockPosts = [
      {
        id: "post-1",
        user_id: "user-456",
        text: "This is a test post",
        tags: ["test", "example"],
        created_at: new Date().toISOString(),
        likes: 5,
        liked_by: [],
        Users: { social_username: "testuser" },
      },
    ];

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "Post") {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        };
      }
      if (table === "Comment") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText("This is a test post")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });
  });

  it("displays post tags", async () => {
    const mockPosts = [
      {
        id: "post-1",
        user_id: "user-456",
        text: "Post with tags",
        tags: ["javascript", "react"],
        created_at: new Date().toISOString(),
        likes: 0,
        liked_by: [],
        Users: { social_username: "coder" },
      },
    ];

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === "Post") {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        };
      }
      if (table === "Comment") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText("#javascript")).toBeInTheDocument();
      expect(screen.getByText("#react")).toBeInTheDocument();
    });
  });

  // ===================
  // FRIENDS LIST
  // ===================

  it("displays friends list on Friends tab", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("type=accepted")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              friends: [
                {
                  friendship_id: "f1",
                  user_id: "user-123",
                  friend_id: "user-456",
                  status: "accepted",
                  friendInfo: { user_id: "user-456", social_username: "myfriend" },
                  created_at: new Date().toISOString(),
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ friends: [] }),
      });
    });

    render(<CommunityPage />);

    fireEvent.click(screen.getByRole("button", { name: /friends/i }));

    await waitFor(() => {
      expect(screen.getByText("myfriend")).toBeInTheDocument();
    });
  });
});

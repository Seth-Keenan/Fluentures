import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TeamPage from "./page";

describe("TeamPage", () => {
  it("renders heading, repo link, and all team members", () => {
    render(<TeamPage />);

    // Heading
    expect(
      screen.getByRole("heading", { name: /meet the team/i })
    ).toBeInTheDocument();

    // Repo link
    expect(
      screen.getByRole("link", { name: /view github repo/i })
    ).toBeInTheDocument();

    // Individual team members
    expect(screen.getByText("Seth Ek")).toBeInTheDocument();

    // Specific updated roles
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });
});

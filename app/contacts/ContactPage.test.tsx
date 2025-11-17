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
    expect(screen.getByText("Member Two")).toBeInTheDocument();
    expect(screen.getByText("Member Three")).toBeInTheDocument();
    expect(screen.getByText("Seth Keenan")).toBeInTheDocument();
    expect(screen.getByText("Member Five")).toBeInTheDocument();
    expect(screen.getByText("Member Six")).toBeInTheDocument();

    // Specific updated roles
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Engineer")).toBeInTheDocument();
    expect(
      screen.getByText("QA, Frontend, and Hosting")
    ).toBeInTheDocument(); // <-- updated

    expect(screen.getByText("DevOps Engineer")).toBeInTheDocument();
    expect(screen.getByText("Mobile Developer")).toBeInTheDocument();
  });
});

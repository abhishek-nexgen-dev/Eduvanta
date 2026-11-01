import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoginPage from "./features/login/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

describe("App", () => {
  it("renders the home page heading", () => {
    const queryClient = new QueryClient();
    render(
      <>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </QueryClientProvider>
      </>,
    );
    const headingElements = screen.getAllByText(/Eduvanta|Ednora/i);
    expect(headingElements.length).toBeGreaterThan(0);
    expect(headingElements[0]).toBeInTheDocument();
  });
});

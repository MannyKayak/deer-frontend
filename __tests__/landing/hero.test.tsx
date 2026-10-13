import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/hero";
import type { HomeContent } from "@/lib/data/types";

const CONTENT: HomeContent = {
  title: "Titolo dal backoffice",
  subtitle: "Sottotitolo dal backoffice",
  cta: { label: "Inizia ora", note: "Gratis per sempre" },
  stats: [
    { value: "10", label: "domande di prova" },
    { value: "5 min", label: "per finire" },
  ],
  image: { src: "/image/hero-deer-lab.png", alt: "Il cervo Remindeer", remote: false },
};

const REMOTE_IMAGE = {
  src: "https://project.supabase.co/storage/v1/object/public/page-images/a1b2c3.png",
  alt: "",
  remote: true,
};

describe("Hero", () => {
  test("shows the content it is given, with the CTA always pointing to the quiz", () => {
    render(<Hero content={CONTENT} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Titolo dal backoffice");
    expect(screen.getByText("Sottotitolo dal backoffice")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Inizia ora/ }).getAttribute("href")).toBe("/quiz");
    expect(screen.getByText("Gratis per sempre")).toBeTruthy();
    expect(screen.getByText("Concorso pubblico farmacie")).toBeTruthy();
  });

  test("renders one item per stat", () => {
    render(<Hero content={CONTENT} />);

    for (const text of ["10", "domande di prova", "5 min", "per finire"]) {
      expect(screen.getByText(text)).toBeTruthy();
    }
  });

  test("renders no stats row at all when there are no stats", () => {
    const { container: withStats } = render(<Hero content={CONTENT} />);
    const { container: withoutStats } = render(<Hero content={{ ...CONTENT, stats: [] }} />);

    expect(withStats.querySelectorAll(".flex-wrap")).toHaveLength(1);
    expect(withoutStats.querySelectorAll(".flex-wrap")).toHaveLength(0);
  });

  test("renders the mascot at its own size, as the LCP image", () => {
    render(<Hero content={CONTENT} />);

    const image = screen.getByRole("img", { name: "Il cervo Remindeer" });
    expect(image.getAttribute("width")).toBe("1213");
    expect(image.getAttribute("height")).toBe("1217");
    expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("fetchpriority")).toBe("high");
  });

  test("renders a remote image inside a square box, decorative when it has no description", () => {
    const { container } = render(<Hero content={{ ...CONTENT, image: REMOTE_IMAGE }} />);

    const image = container.querySelector("img");
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.hasAttribute("width")).toBe(false);
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("fetchpriority")).toBe("high");
    expect(image?.getAttribute("src")).toContain(encodeURIComponent(REMOTE_IMAGE.src));
    expect(image?.parentElement?.className).toContain("aspect-square");
  });
});

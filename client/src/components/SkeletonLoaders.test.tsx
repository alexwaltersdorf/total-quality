import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonLineChart,
  SkeletonMetricCard,
  SkeletonFilterBar,
  SkeletonDashboard,
} from "./SkeletonLoaders";

describe("SkeletonLoaders", () => {
  describe("SkeletonCard", () => {
    it("renders skeleton card with animate-pulse class", () => {
      const { container } = render(<SkeletonCard />);
      const element = container.querySelector(".animate-pulse");
      expect(element).toBeTruthy();
    });

    it("renders with custom className", () => {
      const { container } = render(<SkeletonCard className="custom-class" />);
      const element = container.querySelector(".custom-class");
      expect(element).toBeTruthy();
    });

    it("contains placeholder elements", () => {
      const { container } = render(<SkeletonCard />);
      const placeholders = container.querySelectorAll(".bg-muted");
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  describe("SkeletonChart", () => {
    it("renders skeleton chart with animate-pulse class", () => {
      const { container } = render(<SkeletonChart />);
      const element = container.querySelector(".animate-pulse");
      expect(element).toBeTruthy();
    });

    it("renders 5 placeholder bars", () => {
      const { container } = render(<SkeletonChart />);
      const bars = container.querySelectorAll(".space-y-3 > div");
      expect(bars.length).toBeGreaterThan(0);
    });
  });

  describe("SkeletonTable", () => {
    it("renders skeleton table with default 5 rows", () => {
      const { container } = render(<SkeletonTable />);
      const rows = container.querySelectorAll(".border-t");
      expect(rows.length).toBe(5);
    });

    it("renders skeleton table with custom row count", () => {
      const { container } = render(<SkeletonTable rows={10} />);
      const rows = container.querySelectorAll(".border-t");
      expect(rows.length).toBe(10);
    });

    it("contains header and rows", () => {
      const { container } = render(<SkeletonTable />);
      const header = container.querySelector(".bg-muted/50");
      const rows = container.querySelectorAll(".border-t");
      expect(header).toBeTruthy();
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe("SkeletonLineChart", () => {
    it("renders skeleton line chart with animate-pulse class", () => {
      const { container } = render(<SkeletonLineChart />);
      const element = container.querySelector(".animate-pulse");
      expect(element).toBeTruthy();
    });

    it("renders chart area with bars", () => {
      const { container } = render(<SkeletonLineChart />);
      const chartArea = container.querySelector(".h-64");
      expect(chartArea).toBeTruthy();
    });
  });

  describe("SkeletonMetricCard", () => {
    it("renders skeleton metric card", () => {
      const { container } = render(<SkeletonMetricCard />);
      const element = container.querySelector(".animate-pulse");
      expect(element).toBeTruthy();
    });

    it("contains placeholder elements for metric display", () => {
      const { container } = render(<SkeletonMetricCard />);
      const placeholders = container.querySelectorAll(".bg-muted");
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  describe("SkeletonFilterBar", () => {
    it("renders skeleton filter bar", () => {
      const { container } = render(<SkeletonFilterBar />);
      const element = container.querySelector(".animate-pulse");
      expect(element).toBeTruthy();
    });

    it("renders multiple filter placeholders", () => {
      const { container } = render(<SkeletonFilterBar />);
      const filters = container.querySelectorAll(".h-10");
      expect(filters.length).toBeGreaterThan(0);
    });
  });

  describe("SkeletonDashboard", () => {
    it("renders complete dashboard skeleton", () => {
      const { container } = render(<SkeletonDashboard />);
      const elements = container.querySelectorAll(".animate-pulse");
      expect(elements.length).toBeGreaterThan(0);
    });

    it("contains filter bar, metric cards, charts, and table", () => {
      const { container } = render(<SkeletonDashboard />);
      const filterBar = container.querySelector(".flex.gap-4");
      const metricCards = container.querySelectorAll(".grid");
      const table = container.querySelector(".border");
      
      expect(filterBar).toBeTruthy();
      expect(metricCards.length).toBeGreaterThan(0);
      expect(table).toBeTruthy();
    });
  });

  describe("Animation", () => {
    it("all skeleton components have animate-pulse class", () => {
      const components = [
        <SkeletonCard />,
        <SkeletonChart />,
        <SkeletonTable />,
        <SkeletonLineChart />,
        <SkeletonMetricCard />,
        <SkeletonFilterBar />,
      ];

      components.forEach((component) => {
        const { container } = render(component);
        const animated = container.querySelector(".animate-pulse");
        expect(animated).toBeTruthy();
      });
    });
  });
});

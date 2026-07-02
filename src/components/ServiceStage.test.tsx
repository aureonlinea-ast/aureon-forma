import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ServiceStage from "./ServiceStage";
import { allServices } from "@/data/services";

/**
 * Automated responsive QA: every ServiceStage media element must be
 * true full-bleed — no borders, no letterboxing — at every common
 * mobile/tablet/desktop viewport.
 *
 * We assert the styling contract that produces full-bleed:
 *   - w-full h-full        (fills the sticky h-screen container)
 *   - object-cover         (crops, never letterboxes)
 *   - object-center        (centers the crop)
 *   - inline minWidth/Height 100%  (defeats intrinsic <video>/<img> sizing
 *     on ultra-wide/ultra-tall viewports where object-fit alone leaves
 *     transparent bars on Safari + old Chromium)
 */

const VIEWPORTS: Array<[string, number, number]> = [
  ["iPhone SE", 375, 667],
  ["iPhone 14 Pro", 393, 852],
  ["Pixel 7", 412, 915],
  ["iPad mini portrait", 768, 1024],
  ["iPad Pro landscape", 1366, 1024],
  ["Laptop", 1440, 900],
  ["Desktop", 1920, 1080],
  ["Ultra-wide", 2560, 1080],
];

const setViewport = (w: number, h: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: w });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: h });
  window.dispatchEvent(new Event("resize"));
};

const renderStage = (index: number) =>
  render(
    <MemoryRouter>
      <ServiceStage service={allServices[index]} index={index} />
    </MemoryRouter>,
  );

const assertFullBleed = (el: HTMLElement) => {
  expect(el.className).toMatch(/\bw-full\b/);
  expect(el.className).toMatch(/\bh-full\b/);
  expect(el.className).toMatch(/object-cover/);
  expect(el.className).toMatch(/object-center/);
  expect(el.style.minWidth).toBe("100%");
  expect(el.style.minHeight).toBe("100%");
};

describe("ServiceStage responsive full-bleed media", () => {
  afterEach(cleanup);

  for (const [name, w, h] of VIEWPORTS) {
    describe(`viewport: ${name} (${w}x${h})`, () => {
      beforeEach(() => setViewport(w, h));

      allServices.forEach((svc, i) => {
        it(`${svc.title}: media element is full-bleed`, () => {
          const { container } = renderStage(i);
          const media =
            container.querySelector("video") ??
            container.querySelector("img");
          expect(media, `no media element rendered for ${svc.title}`).toBeTruthy();
          assertFullBleed(media as HTMLElement);
        });
      });

      it("sticky stage container fills the viewport height", () => {
        const { container } = renderStage(0);
        const sticky = container.querySelector(".sticky");
        expect(sticky, "sticky container missing").toBeTruthy();
        expect((sticky as HTMLElement).className).toMatch(/h-screen/);
        expect((sticky as HTMLElement).className).toMatch(/w-full/);
        expect((sticky as HTMLElement).className).toMatch(/overflow-hidden/);
      });
    });
  }

  it("video stages provide a poster so no black frame flashes before load", () => {
    for (let i = 0; i < allServices.length; i++) {
      const { container, unmount } = renderStage(i);
      const video = container.querySelector("video");
      if (video) {
        expect(
          video.getAttribute("poster"),
          `${allServices[i].title} <video> is missing a poster`,
        ).toBeTruthy();
      }
      unmount();
    }
  });
});
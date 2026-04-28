// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppI18nProvider } from "@/i18n/provider";
import { i18n } from "@/i18n/config";
import { RenameThreadPrompt } from "./RenameThreadPrompt";

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

describe("RenameThreadPrompt", () => {
  it("handles backdrop and keyboard actions", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { container } = render(
      <AppI18nProvider>
        <RenameThreadPrompt
          currentName="Old name"
          name="New name"
          onChange={vi.fn()}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </AppI18nProvider>,
    );

    const input = screen.getByLabelText("New name");
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    const backdrop = container.querySelector(".ds-modal-backdrop");
    expect(backdrop).toBeTruthy();
    if (!backdrop) {
      throw new Error("Expected rename thread backdrop");
    }
    fireEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});

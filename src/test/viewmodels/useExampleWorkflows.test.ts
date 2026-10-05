import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDataShowcaseViewModel } from "@/viewmodels/useDataShowcaseViewModel";
import { useDemoSubmission } from "@/viewmodels/useDemoSubmission";
import { useFormsViewModel } from "@/viewmodels/useFormsViewModel";
import { useSettingsViewModel } from "@/viewmodels/useSettingsViewModel";

describe("local example service lifecycle", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());
	it("keeps the submitted snapshot, rejects duplicate submits, and retries a failure", () => {
		const { result } = renderHook(() => useDemoSubmission<{ name: string }>());
		act(() => result.current.retry());
		expect(result.current.status).toBe("idle");
		act(() => result.current.setFailNext(true));
		act(() => {
			expect(result.current.submit({ name: "Alex" })).toBe(true);
			expect(result.current.submit({ name: "Duplicate" })).toBe(false);
		});
		expect(result.current.status).toBe("pending");
		expect(result.current.failNext).toBe(false);
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.status).toBe("error");
		expect(result.current.result).toBeNull();
		act(() => result.current.retry());
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.result).toEqual({ name: "Alex" });
		expect(result.current.status).toBe("success");
	});
	it("cancels pending work, preserves the last saved result, and clears timers on unmount", () => {
		const { result, unmount } = renderHook(() => useDemoSubmission<string>());
		act(() => result.current.submit("saved"));
		act(() => vi.advanceTimersByTime(500));
		act(() => result.current.submit("cancelled"));
		act(() => result.current.cancel());
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.result).toBe("saved");
		expect(result.current.status).toBe("idle");
		act(() => result.current.cancel());
		act(() => result.current.submit("unmounted"));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
	it("validates passwords without retaining them in submitted form results", () => {
		const { result } = renderHook(() => useFormsViewModel());
		act(() => result.current.updateSecurity("short", "short", false));
		expect(result.current.passwordError).toBe(true);
		act(() => result.current.updateSecurity("long-enough", "different", false));
		expect(result.current.security.status).toBe("idle");
		act(() => result.current.updateSecurity("long-enough", "long-enough", true));
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.passwordError).toBe(false);
		expect(result.current.security.result).toEqual({ twoFactor: true });
		act(() => {
			result.current.setFiles([{ name: "report.pdf", size: 1024 }]);
			result.current.setDetailsOpen(true);
		});
		expect(result.current.files).toEqual([{ name: "report.pdf", size: 1024 }]);
		expect(result.current.detailsOpen).toBe(true);
	});
	it("saves, cancels, and restores settings while keeping preferences across section switches", () => {
		const { result } = renderHook(() => useSettingsViewModel());
		act(() => result.current.changeField("firstName", "Taylor"));
		act(() => result.current.saveProfile());
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.profile.firstName).toBe("Taylor");
		act(() => result.current.changeField("firstName", "Unsaved"));
		act(() => result.current.cancelProfile());
		expect(result.current.draft.firstName).toBe("Taylor");
		act(() => {
			result.current.setNotification("email", false);
			result.current.setSecurityPreference("authenticator", true);
			result.current.setPhoto("portrait.png");
			result.current.setCurrency("EUR");
			result.current.setCompact(true);
			result.current.setActiveSection("appearance");
		});
		expect(result.current).toMatchObject({
			activeSection: "appearance",
			photo: "portrait.png",
			currency: "EUR",
			compact: true,
			notice: "preferences",
		});
		expect(result.current.notifications.email).toBe(false);
		expect(result.current.securityPreferences.authenticator).toBe(true);
	});
	it("validates security updates and prevents removal of the current session", () => {
		const { result } = renderHook(() => useSettingsViewModel());
		act(() => result.current.updatePassword("", "valid-pass", "valid-pass"));
		expect(result.current.passwordError).toBe(true);
		act(() => result.current.updatePassword("current", "short", "short"));
		expect(result.current.passwordError).toBe(true);
		act(() => result.current.updatePassword("current", "valid-pass", "different"));
		expect(result.current.passwordSave.status).toBe("idle");
		act(() => result.current.updatePassword("current", "valid-pass", "valid-pass"));
		act(() => vi.advanceTimersByTime(500));
		expect(result.current.passwordSave.result).toEqual({ changed: true });
		act(() => result.current.revoke("iPhone 15 — Safari"));
		expect(result.current.sessions.map((session) => session.device)).toEqual([
			"MacBook Pro — Chrome",
			"Windows PC — Firefox",
		]);
		act(() => result.current.revoke("MacBook Pro — Chrome"));
		expect(result.current.sessions).toHaveLength(2);
		expect(result.current.notice).toBe("revoked");
	});
});

describe("invoice data composition", () => {
	it("filters, sorts raw amounts, resets page selection, and exposes empty results", () => {
		const { result } = renderHook(() => useDataShowcaseViewModel());
		expect(result.current.rows.map((row) => row.id)).toEqual(["INV-2041", "INV-2042"]);
		act(() => result.current.setPage(99));
		expect(result.current.page).toBe(2);
		act(() => result.current.setQuery("  ATLAS "));
		expect(result.current.page).toBe(1);
		expect(result.current.rows.map((row) => row.customer)).toEqual(["Atlas Works"]);
		act(() => result.current.setStatus("Pending"));
		expect(result.current.total).toBe(0);
		expect(result.current.rows).toEqual([]);
		act(() => result.current.reset());
		act(() => result.current.sortBy("amount"));
		expect(result.current.rows.map((row) => row.amount)).toEqual([3250, 5950]);
		act(() => result.current.sortBy("amount"));
		expect(result.current.rows.map((row) => row.amount)).toEqual([12400, 8100]);
		act(() => result.current.setStatus("Paid"));
		expect(result.current.total).toBe(2);
		act(() => result.current.sortBy("customer"));
		expect(result.current.rows[0].customer).toBe("Atlas Works");
		act(() => result.current.setPage(-1));
		expect(result.current.page).toBe(1);
	});
});

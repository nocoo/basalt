import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChatViewModel } from "@/viewmodels/useChatViewModel";
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

describe("chat streaming lifecycle", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());
	it("appends the user message immediately and streams one reply for rapid duplicate sends", () => {
		const { result } = renderHook(() => useChatViewModel());
		act(() => {
			result.current.send("   ");
			result.current.retry();
			result.current.stop();
		});
		expect(result.current.messages).toHaveLength(3);
		act(() => {
			result.current.send("  Explain today's traffic  ");
			result.current.send("Duplicate");
		});
		expect(result.current.messages[result.current.messages.length - 2]?.text).toBe(
			"Explain today's traffic",
		);
		expect(result.current.messages).toHaveLength(5);
		expect(result.current.status).toBe("streaming");
		act(() => vi.advanceTimersByTime(100));
		const partial = result.current.messages[result.current.messages.length - 1]?.text ?? "";
		expect(partial).toHaveLength(24);
		act(() => vi.advanceTimersByTime(3000));
		expect(result.current.status).toBe("complete");
		expect(result.current.messages[result.current.messages.length - 1]?.text).toContain(
			"12,840 requests",
		);
		expect(vi.getTimerCount()).toBe(0);
	});
	it("keeps a failed response and retries without duplicating its user message", () => {
		const { result } = renderHook(() => useChatViewModel());
		act(() => result.current.setFailNext(true));
		act(() => result.current.send("Explain failures"));
		act(() => vi.advanceTimersByTime(200));
		expect(result.current.status).toBe("error");
		expect(result.current.messages[result.current.messages.length - 1]?.text).toHaveLength(48);
		act(() => result.current.retry());
		act(() => vi.advanceTimersByTime(3000));
		expect(result.current.status).toBe("complete");
		expect(
			result.current.messages.filter((message) => message.text === "Explain failures"),
		).toHaveLength(1);
		expect(result.current.messages).toHaveLength(5);
	});
	it("stops on a thread change, isolates histories, clears messages, and cleans up on unmount", () => {
		const { result, unmount } = renderHook(() => useChatViewModel());
		act(() => {
			result.current.selectThread("unknown");
			result.current.selectThread("analytics");
		});
		expect(result.current.thread.title).toBe("Analytics");
		act(() => result.current.send("First thread"));
		act(() => vi.advanceTimersByTime(100));
		act(() => result.current.selectThread("quality"));
		expect(vi.getTimerCount()).toBe(0);
		expect(result.current.messages).toHaveLength(3);
		act(() => result.current.retry());
		expect(result.current.status).toBe("idle");
		act(() => result.current.send("Second thread"));
		act(() => vi.advanceTimersByTime(3000));
		expect(result.current.messages[result.current.messages.length - 1]?.text).toContain("99.8%");
		act(() => result.current.selectThread("analytics"));
		expect(result.current.messages[result.current.messages.length - 1]?.text).toHaveLength(24);
		act(() => result.current.clear());
		expect(result.current.messages).toEqual([]);
		act(() => result.current.send("Unmount test"));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
	it("retains partial output on stop and can clear an active generation", () => {
		const { result } = renderHook(() => useChatViewModel());
		act(() => result.current.send("Keep partial"));
		act(() => vi.advanceTimersByTime(100));
		act(() => result.current.stop());
		expect(result.current.status).toBe("stopped");
		expect(result.current.messages[result.current.messages.length - 1]?.text).toHaveLength(24);
		act(() => result.current.retry());
		act(() => result.current.clear());
		expect(vi.getTimerCount()).toBe(0);
		expect(result.current.status).toBe("idle");
		expect(result.current.messages).toEqual([]);
	});
});

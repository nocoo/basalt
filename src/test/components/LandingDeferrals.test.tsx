import { act, render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { MemoryRouter, useNavigate } from "react-router";
import { describe, expect, it } from "vitest";
import { DeferredToaster } from "@/components/DeferredToaster";
import { I18nReady } from "@/components/I18nReady";
import i18n from "@/i18n";
import { loadI18n } from "@/i18n/load";

let navigate: ReturnType<typeof useNavigate>;

function Navigation() {
	navigate = useNavigate();
	return null;
}

describe("landing-only deferrals", () => {
	it("mounts the toaster with the first non-landing route and keeps it", async () => {
		const { container } = render(
			<MemoryRouter initialEntries={["/"]}>
				<Navigation />
				<DeferredToaster />
			</MemoryRouter>,
		);
		expect(container.innerHTML).toBe("");
		await act(async () => navigate("/components"));
		expect(await screen.findByRole("region", { name: /Notifications/ })).toBeInTheDocument();
		await act(async () => navigate("/"));
		expect(screen.getByRole("region", { name: /Notifications/ })).toBeInTheDocument();
	});

	it("renders translated routes once i18next is ready", async () => {
		function Translated() {
			const { t } = useTranslation();
			return <p>{t("nav.dashboard")}</p>;
		}
		await act(async () => {
			render(
				<Suspense fallback={<p>Loading</p>}>
					<I18nReady>
						<Translated />
					</I18nReady>
				</Suspense>,
			);
			await loadI18n();
		});
		expect(screen.getByText(i18n.t("nav.dashboard"))).toBeInTheDocument();
		expect(screen.queryByText("Loading")).toBeNull();
	});
});

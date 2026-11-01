let pending: Promise<unknown> | undefined;

/**
 * The landing route renders without translations, so i18next and both locale bundles stay out of
 * the entry chunk. Every other route waits for this single shared import (see I18nReady).
 */
export function loadI18n(): Promise<unknown> {
	pending ??= import("./index");
	return pending;
}

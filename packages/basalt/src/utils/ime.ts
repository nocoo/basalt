type ImeKeyEvent = {
	key?: string;
	isComposing?: boolean;
	keyCode?: number;
	nativeEvent?: { isComposing?: boolean; keyCode?: number; key?: string };
};

/**
 * Guards keyboard handlers against CJK IME composition confirmation,
 * including Safari (WebKit bug 165004) where `isComposing` flips false before keydown.
 */
export function isImeComposing(event: ImeKeyEvent): boolean {
	return Boolean(
		event.isComposing ||
			event.nativeEvent?.isComposing ||
			event.keyCode === 229 ||
			event.nativeEvent?.keyCode === 229 ||
			event.key === "Process" ||
			event.nativeEvent?.key === "Process",
	);
}

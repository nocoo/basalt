import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-[18vw] leading-none font-light text-muted-foreground font-display tracking-tight select-none">
        {t("pages.notFound.title")}
      </h1>
      <a
        href="/"
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        {t("pages.notFound.backHome")}
      </a>
    </div>
  );
}

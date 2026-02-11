export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-[40vw] leading-none font-semibold text-muted-foreground font-display tracking-tight select-none">
        404
      </h1>
      <a
        href="/"
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Back to Homepage
      </a>
    </div>
  );
}

import { Mountain } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex h-72 w-72 items-center justify-center rounded-full bg-secondary dark:bg-[#171717] ring-1 ring-border overflow-hidden p-6">
            <Mountain className="h-28 w-28 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

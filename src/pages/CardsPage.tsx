import { CreditCard, Wifi, Eye, EyeOff, Lock, NfcIcon } from "lucide-react";
import { useState } from "react";
import { creditCards } from "@/data/mock";
import type { CreditCard as CreditCardType } from "@/data/mock";

function NetworkLogo({ network }: { network: CreditCardType["network"] }) {
  switch (network) {
    case "visa":
      return <span className="text-lg font-extrabold italic tracking-tight">VISA</span>;
    case "mastercard":
      return (
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full bg-red-500 opacity-80" />
          <div className="-ml-2 h-5 w-5 rounded-full bg-yellow-400 opacity-80" />
        </div>
      );
    case "amex":
      return <span className="text-xs font-bold tracking-wider">AMEX</span>;
    default:
      return null;
  }
}

function ChipIcon({ isBlack }: { isBlack: boolean }) {
  return (
    <div className={`h-8 w-10 rounded-md ${isBlack ? "bg-amber-300/80" : "bg-amber-200/80"} flex items-center justify-center`}>
      <div className={`h-5 w-7 rounded-sm border ${isBlack ? "border-amber-600/50" : "border-amber-400/60"} grid grid-cols-3 grid-rows-2 gap-px p-px`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${isBlack ? "bg-amber-500/40" : "bg-amber-300/50"} rounded-[1px]`} />
        ))}
      </div>
    </div>
  );
}

export default function CardsPage() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{creditCards.length} cards active</span>
        <button onClick={() => setShowBalance(!showBalance)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          {showBalance ? <Eye className="h-4 w-4" strokeWidth={1.5} /> : <EyeOff className="h-4 w-4" strokeWidth={1.5} />}
          {showBalance ? "Hide" : "Show"} balances
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 justify-items-center">
        {creditCards.map((card) => {
          const isBlack = card.network === "amex";
          const textMuted = isBlack ? "text-amber-200/60" : "text-white/60";
          const textSecondary = isBlack ? "text-amber-100/80" : "text-white/80";
          const textPrimary = isBlack ? "text-amber-50" : "text-white";

          return (
            <div
              key={card.name}
              className={`aspect-[86/54] w-full max-w-sm rounded-2xl bg-gradient-to-br ${card.color} p-5 relative overflow-hidden flex flex-col justify-between shadow-lg`}
            >
              {/* Decorative circles */}
              <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full ${isBlack ? "bg-white/[0.03]" : "bg-white/[0.06]"}`} />
              <div className={`absolute -bottom-8 -left-8 h-32 w-32 rounded-full ${isBlack ? "bg-white/[0.02]" : "bg-white/[0.04]"}`} />

              {/* Top row: bank name + contactless */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className={`text-sm font-semibold ${textPrimary}`}>{card.bank}</p>
                  <p className={`text-[10px] ${textMuted} mt-0.5`}>{card.name}</p>
                </div>
                <NfcIcon className={`h-5 w-5 ${textMuted}`} strokeWidth={1.5} />
              </div>

              {/* Middle: chip + card number */}
              <div className="relative z-10 space-y-3">
                <ChipIcon isBlack={isBlack} />
                <p className={`text-sm font-mono tracking-[0.2em] ${textSecondary}`}>{card.number}</p>
              </div>

              {/* Bottom row: expiry + balance + network logo */}
              <div className="flex items-end justify-between relative z-10">
                <div className="flex gap-6">
                  <div>
                    <p className={`text-[9px] uppercase ${textMuted}`}>Valid Thru</p>
                    <p className={`text-xs font-mono ${textSecondary}`}>{card.expiry}</p>
                  </div>
                  <div>
                    <p className={`text-[9px] uppercase ${textMuted}`}>Balance</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>
                      {showBalance ? `$${card.balance.toLocaleString()}` : "••••••"}
                    </p>
                  </div>
                </div>
                <div className={textPrimary}>
                  <NetworkLogo network={card.network} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage bar */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {creditCards.map((card) => (
          <div key={card.name} className="rounded-[14px] bg-secondary p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{card.bank} {card.name}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round((card.balance / card.limit) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/60 transition-all"
                style={{ width: `${(card.balance / card.limit) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              ${card.balance.toLocaleString()} / ${card.limit.toLocaleString()} limit
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[14px] bg-secondary p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">Card Security</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {["Online Payments", "Contactless", "ATM Withdrawal"].map((feat) => (
            <div key={feat} className="flex items-center justify-between rounded-[10px] bg-card p-3">
              <span className="text-sm text-foreground">{feat}</span>
              <div className="h-5 w-9 rounded-full bg-success/20 flex items-center justify-end px-0.5">
                <div className="h-4 w-4 rounded-full bg-success" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

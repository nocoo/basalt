import { useState } from "react";
import {
  MousePointerClick, Loader2, Plus, Trash2, Download,
  ChevronDown, Mail, Heart, Share2, Copy, Check,
} from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/ui/button";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-secondary p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function LoadingButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Processing..." : "Submit"}
    </Button>
  );
}

function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <Check className="mr-2 h-3.5 w-3.5" />
      ) : (
        <Copy className="mr-2 h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

export default function ButtonsPage() {
  return (
    <div className="space-y-4">
      <PageIntro
        title="Buttons and action triggers"
        description="All button variants, sizes, states, and composition patterns using the Button component."
        eyebrow="Buttons"
        icon={MousePointerClick}
      />

      {/* Variants */}
      <Section title="Variants" icon={MousePointerClick}>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </Section>

      {/* Sizes */}
      <Section title="Sizes" icon={MousePointerClick}>
        <div className="flex flex-wrap items-end gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      {/* With Icons */}
      <Section title="With Icons" icon={MousePointerClick}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline">
            Share
            <Share2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Section>

      {/* States */}
      <Section title="States" icon={MousePointerClick}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">disabled</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Default</Button>
              <Button variant="secondary" disabled>Secondary</Button>
              <Button variant="destructive" disabled>Destructive</Button>
              <Button variant="outline" disabled>Outline</Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">loading</p>
            <div className="flex flex-wrap items-center gap-3">
              <LoadingButton />
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Icon Buttons */}
      <Section title="Icon Buttons" icon={MousePointerClick}>
        <div className="flex flex-wrap items-center gap-3">
          {(["default", "secondary", "outline", "ghost", "destructive"] as const).map((v) => (
            <Button key={v} variant={v} size="icon" aria-label={v}>
              <Heart className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </Section>

      {/* Button Groups */}
      <Section title="Button Groups" icon={MousePointerClick}>
        <div className="space-y-4">
          {/* Primary + secondary pair */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">primary + secondary</p>
            <div className="flex items-center gap-2">
              <Button>Save changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
          {/* Segmented group */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">segmented</p>
            <div className="inline-flex rounded-lg border border-input overflow-hidden">
              <Button variant="ghost" className="rounded-none border-r border-input">
                Left
              </Button>
              <Button variant="ghost" className="rounded-none border-r border-input">
                Center
              </Button>
              <Button variant="ghost" className="rounded-none">
                Right
              </Button>
            </div>
          </div>
          {/* Split button */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">split button</p>
            <div className="inline-flex">
              <Button className="rounded-r-none">
                Save
              </Button>
              <Button className="rounded-l-none border-l border-primary-foreground/20 px-2" aria-label="More options">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Interactive Patterns */}
      <Section title="Interactive Patterns" icon={MousePointerClick}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">copy to clipboard</p>
            <CopyButton />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">confirmation destructive</p>
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete account
              </Button>
              <span className="text-xs text-muted-foreground">This action cannot be undone.</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">full width</p>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create new project
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}

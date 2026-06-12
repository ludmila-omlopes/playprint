type IllustrationProps = {
  className?: string;
};

function IllustrationShell({
  children,
  className,
  title,
}: IllustrationProps & {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      role="img"
      viewBox="0 0 80 80"
    >
      <title>{title}</title>
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        {children}
      </g>
    </svg>
  );
}

export function MemoryCardIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationShell className={className} title="Memory card">
      <path d="M22 13h28l8 8v46H22z" />
      <path d="M30 13v16h19V13" />
      <path d="M31 45h18" />
      <path d="M31 55h11" />
      <path d="M58 21h-8" />
    </IllustrationShell>
  );
}

export function StackCasesIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationShell className={className} title="Stack of game cases">
      <path d="M18 49l39-12 5 16-39 12z" />
      <path d="M16 34l40-6 3 15-40 6z" />
      <path d="M19 20h40v14H19z" />
      <path d="M28 24h16" />
      <path d="M28 38l17-3" />
      <path d="M30 53l14-4" />
    </IllustrationShell>
  );
}

export function ControllerIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationShell className={className} title="Resting controller">
      <path d="M22 38c3-9 8-12 18-8 10-4 15-1 18 8l5 16c1 5-4 8-8 5l-8-7H33l-8 7c-4 3-9 0-8-5z" />
      <path d="M29 42h10" />
      <path d="M34 37v10" />
      <path d="M50 39h.2" />
      <path d="M56 45h.2" />
    </IllustrationShell>
  );
}

export function MugIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationShell className={className} title="Warm mug">
      <path d="M24 32h30v19c0 7-5 12-12 12h-6c-7 0-12-5-12-12z" />
      <path d="M54 38h5c4 0 7 3 7 7s-3 7-7 7h-5" />
      <path d="M32 20c-3-4 3-6 0-10" />
      <path d="M43 20c-3-4 3-6 0-10" />
    </IllustrationShell>
  );
}

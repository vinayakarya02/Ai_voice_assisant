import { cn } from "@/utils/cn";

/**
 * The Nova brand mark: a gradient orb with three "audio" bars. Purely
 * decorative, so it's hidden from assistive tech (the wordmark carries meaning).
 */
export function Logo({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        aria-hidden="true"
        role="img"
      >
        <defs>
          <linearGradient id="nova-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect
          x="1.5"
          y="1.5"
          width="37"
          height="37"
          rx="12"
          fill="url(#nova-grad)"
        />
        <g
          fill="#ffffff"
          fillOpacity="0.95"
          transform="translate(0,0)"
        >
          <rect x="12" y="16" width="3.4" height="8" rx="1.7" />
          <rect x="18.3" y="11" width="3.4" height="18" rx="1.7" />
          <rect x="24.6" y="16" width="3.4" height="8" rx="1.7" />
        </g>
      </svg>
    </span>
  );
}

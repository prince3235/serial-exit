import { useId } from "react";

/**
 * VerifiedSeal — code-drawn SVG "VERIFIED OFF-MARKET" seal.
 * Concentric ring with rotated mono text, amber glow.
 */
export function VerifiedSeal({
  className,
  size = 88,
  label = "Verified Off-Market",
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  // Unique per instance: the seal renders several times per page and SVG ids must not collide.
  const uid = useId().replace(/:/g, "");
  const id = `se-seal-grad-${uid}`;
  const glowId = `se-seal-glow-${uid}`;
  const pathId = `se-seal-path-${uid}`;
  // Build the circular text path: text sits on a circle of radius r
  const r = 34;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB37A" />
          <stop offset="55%" stopColor="#FF7A1A" />
          <stop offset="100%" stopColor="#B85A14" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer hairline ring */}
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="rgba(255,122,26,0.35)"
        strokeWidth="0.6"
      />
      {/* Rotating mono text on a circle */}
      <g filter={`url(#${glowId})`}>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <text
          fill="#FF7A1A"
          fontFamily="var(--font-mono), monospace"
          fontSize="6.2"
          letterSpacing="2.4"
          fontWeight="500"
        >
          <textPath
            href={`#${pathId}`}
            startOffset="0"
          >
            {label.toUpperCase()} · {label.toUpperCase()} ·
          </textPath>
        </text>
      </g>
      <defs>
        <path
          id={pathId}
          d={`M 50,50 m -${r},0 a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 -${2 * r},0`}
          fill="none"
        />
      </defs>

      {/* Inner mark — amber dot + tick */}
      <g>
        <circle cx="50" cy="50" r="9" fill={`url(#${id})`} opacity="0.18" />
        <circle cx="50" cy="50" r="5" fill={`url(#${id})`} />
        <path
          d="M47 50 L49.4 52.6 L53.4 47.8"
          stroke="#050505"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

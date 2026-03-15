export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="grad"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Outer rounded rect */}
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#grad)" opacity="0.15" />
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="url(#grad)" strokeWidth="1.5" />
      {/* Three columns */}
      <rect x="5" y="8" width="6" height="16" rx="2" fill="url(#grad)" opacity="0.8" />
      <rect x="13" y="8" width="6" height="10" rx="2" fill="url(#grad)" opacity="0.8" />
      <rect x="21" y="8" width="6" height="13" rx="2" fill="url(#grad)" opacity="0.8" />
    </svg>
  );
}

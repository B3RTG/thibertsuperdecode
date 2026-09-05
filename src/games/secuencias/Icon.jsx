// Secuencias icon — a 2x2 Simon-style pad on the app's dark frame.
export default function SecuenciasIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="48"
      height="48"
      role="img"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#0E1420" />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="12.5"
        fill="none"
        stroke="#1F2A3A"
        strokeWidth="3"
      />
      <rect x="12" y="12" width="18" height="18" rx="4" fill="#FF4D5E" />
      <rect x="34" y="12" width="18" height="18" rx="4" fill="#FFD23F" />
      <rect x="12" y="34" width="18" height="18" rx="4" fill="#3DDC84" />
      <rect x="34" y="34" width="18" height="18" rx="4" fill="#5B6BFF" />
    </svg>
  );
}

// Superdecoder icon — same 4-LED motif as the app favicon (public/favicon.svg).
export default function SuperdecoderIcon() {
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
      <circle cx="22" cy="22" r="8" fill="#FF4D5E" />
      <circle cx="42" cy="22" r="8" fill="#FFD23F" />
      <circle cx="22" cy="42" r="8" fill="#3DDC84" />
      <circle cx="42" cy="42" r="8" fill="#21D4FD" />
    </svg>
  );
}

// Apaga las luces icon — a small grid with some lights on, on the app frame.
export default function LucesIcon() {
  const on = '#FFD23F';
  const off = '#2a3446';
  // 3x3 grid of cells (12px each) with a diagonal-ish pattern of lit ones.
  const xs = [14, 30, 46];
  const ys = [14, 30, 46];
  const lit = new Set(['0,0', '1,1', '2,0', '0,2', '2,2']);
  const rects = [];
  ys.forEach((y, r) =>
    xs.forEach((x, c) => {
      rects.push(
        <rect
          key={`${r},${c}`}
          x={x}
          y={y}
          width="12"
          height="12"
          rx="3"
          fill={lit.has(`${r},${c}`) ? on : off}
        />,
      );
    }),
  );
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
      {rects}
    </svg>
  );
}

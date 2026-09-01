/**
 * Set de iconos del producto: SVG en línea, grilla de 20, trazo 1.7
 * (2.2+ solo para los checks, que necesitan peso a tamaño pequeño).
 * Sin emoji y sin librería externa: heredan currentColor y escalan.
 */
type IconProps = { className?: string };

function Svg({
  className = "h-[18px] w-[18px]",
  strokeWidth = 1.7,
  children,
}: IconProps & { strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PanelIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </Svg>
  );
}

export function DocIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 2.5h6l4 4v11H5z" />
      <path d="M11 2.5v4h4" />
      <path d="M7.5 10.5h5M7.5 13.5h3" />
    </Svg>
  );
}

export function BriefcaseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="6" width="15" height="10.5" rx="2" />
      <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6" />
    </Svg>
  );
}

export function SendIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M17.5 2.5L9 11" />
      <path d="M17.5 2.5l-5.5 15-3-6.5-6.5-3z" />
    </Svg>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.6v2M10 15.4v2M2.6 10h2M15.4 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" />
    </Svg>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={2}>
      <path d="M10 4.5v11M4.5 10h11" />
    </Svg>
  );
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.8}>
      <path d="M7.5 4l6 6-6 6" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={2.2}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </Svg>
  );
}

export function CloseIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={2.2}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </Svg>
  );
}

export function InfoIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.8}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9.2v4.6M10 6.3v.2" />
    </Svg>
  );
}

export function SparkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 3l1.8 4.7L16.5 9.5l-4.7 1.8L10 16l-1.8-4.7L3.5 9.5l4.7-1.8z" />
    </Svg>
  );
}

export function DownloadIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.8}>
      <path d="M10 3.5v9.5M6 9.5l4 4 4-4" />
      <path d="M3.5 16.5h13" />
    </Svg>
  );
}

export function UploadIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 13.5V3.5M6 7.5l4-4 4 4" />
      <path d="M3.5 14v2.5h13V14" />
    </Svg>
  );
}

export function ExternalIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11 3h6v6" />
      <path d="M17 3l-8 8" />
      <path d="M15 12v5H3.5V5.5h5" />
    </Svg>
  );
}

export function EyeOffIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.8}>
      <path d="M3 10s2.6-4.5 7-4.5S17 10 17 10s-2.6 4.5-7 4.5S3 10 3 10z" />
      <path d="M4 16L16 4" />
    </Svg>
  );
}

export function ChatIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M17 9.5c0 3.6-3.1 6.5-7 6.5-.9 0-1.7-.1-2.5-.4L3 17l1.5-3.4A6.2 6.2 0 0 1 3 9.5C3 5.9 6.1 3 10 3s7 2.9 7 6.5z" />
    </Svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 2.5l6 2.2v4.6c0 3.5-2.4 6.7-6 8.2-3.6-1.5-6-4.7-6-8.2V4.7z" />
    </Svg>
  );
}

export function PencilIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13.5 3.5l3 3L7 16H4v-3z" />
    </Svg>
  );
}

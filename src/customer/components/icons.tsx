import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const CartIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M5 12h14" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

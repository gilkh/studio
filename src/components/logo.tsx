import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.5 12.5l5-5" />
      <path d="M6 7l11 11" />
      <path d="m14 6 5.5 5.5" />
      <path d="M14 17.5 9 12.5" />
      <path d="M15 12h.01" />
      <path d="M10 17h.01" />
      <path d="M6.5 17.5h.01" />
      <path d="M8.5 7.5h.01" />
    </svg>
  );
}

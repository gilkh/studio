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
      <path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0-5 5v1a5 5 0 0 0 5 5h1a5 5 0 0 0 5-5v-1a5 5 0 0 0 5-5v-1a5 5 0 0 0-5-5z" />
      <path d="m12 8 4 4" />
      <path d="m8 12 4 4" />
    </svg>
  );
}

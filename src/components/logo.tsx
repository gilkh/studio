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
      <path d="M11.3 6.8a4.5 4.5 0 0 1 7.5 4.5c0 3.3-2.7 6.3-7.5 10.2-4.8-3.9-7.5-6.9-7.5-10.2a4.5 4.5 0 0 1 5.3-4.5" />
      <path d="M12.7 6.8a4.5 4.5 0 0 0-7.5 4.5c0 3.3 2.7 6.3 7.5 10.2 4.8-3.9 7.5-6.9 7.5-10.2a4.5 4.5 0 0 0-5.3-4.5" />
    </svg>
  );
}

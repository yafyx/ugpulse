import type React from "react";

/**
 * CheckIcon Component
 *
 * A reusable SVG icon component that displays a check mark inside a circle.
 *
 * @returns {JSX.Element} The rendered CheckIcon component
 */
export const CheckIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <title>Success</title>
    <path d="M6 9l2 2 4-4" />
    <circle cx="9" cy="9" r="7.25" />
  </svg>
);

export default CheckIcon;

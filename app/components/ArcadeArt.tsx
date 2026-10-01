import { useId } from "react";

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m32 0 7 22 20-12-12 20 17 2-22 7 12 20-20-12-2 17-7-22-20 12 12-20L0 32l22-7L10 5l20 12Z" />
    </svg>
  );
}

export function DonutArt({ className = "" }: { className?: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className={className}
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-dough`}
          x1="50"
          y1="25"
          x2="165"
          y2="205"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE2A1" />
          <stop offset="1" stopColor="#D3893A" />
        </linearGradient>
        <linearGradient
          id={`${id}-icing`}
          x1="55"
          y1="35"
          x2="170"
          y2="185"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFB3D8" />
          <stop offset="1" stopColor="#F457A2" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id}-dough)`}
        stroke="#292323"
        strokeWidth="5"
        fillRule="evenodd"
        d="M110 17a93 93 0 1 0 0 186 93 93 0 0 0 0-186Zm0 62a31 31 0 1 1 0 62 31 31 0 0 1 0-62Z"
      />
      <path
        fill={`url(#${id}-icing)`}
        stroke="#292323"
        strokeWidth="4"
        fillRule="evenodd"
        d="M110 27c15 0 19 12 30 13 12 2 18-2 26 7 8 8 4 17 10 27 6 9 17 13 18 25 1 12-11 17-11 29 0 12 4 21-5 29-9 9-20 3-30 9-10 5-13 20-26 20-11 0-16-10-28-10-12 0-20 7-30 1-10-7-9-21-17-29-8-8-21-8-25-21-4-12 7-20 7-32 0-12-6-18 1-28 7-10 20-7 29-14 10-7 12-20 26-22 10-1 15-4 25-4Zm0 52a31 31 0 1 0 0 62 31 31 0 0 0 0-62Z"
      />
      <g strokeWidth="7" strokeLinecap="round">
        <path stroke="#FFF1A8" d="m67 55 11 7m74 77 10 6m-68 24-5 11" />
        <path
          stroke="#66DAE7"
          d="m130 51 8 10m-91 56 12-4m101-21 10-6m-55 79 12-1"
        />
        <path
          stroke="#7D57C3"
          d="m89 46-3 10m-36 99 8 6m104-88 6 11m-93 84 10-5"
        />
        <path stroke="#FFF9EF" d="m45 83 7 6m115 35-7 9m-40-89 11-2" />
      </g>
      <path
        d="m54 49 10-6"
        stroke="#FFF5ED"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

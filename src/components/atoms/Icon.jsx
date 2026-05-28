const paths = {
  qhome: (
    <>
      <path d="M12 2 4 6.6v10.8L12 22l8-4.6V6.6L12 2Z" />
      <path d="M12 7.1 8.4 9.2v5.6L12 17l3.6-2.2" />
      <path d="m15 15.4 3.6 2.1" />
    </>
  ),
  chat: (
    <>
      <path d="M21 14.5a5.5 5.5 0 0 1-5.5 5.5H8l-5 3v-8.5A5.5 5.5 0 0 1 8.5 9h7A5.5 5.5 0 0 1 21 14.5Z" />
      <path d="M8 13h.01M12 13h.01M16 13h.01" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l5 5v13H7V3Z" />
      <path d="M14 3v6h5M10 13h6M10 17h6" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  mail: (
    <>
      <path d="M4 6h16v12H4V6Z" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <path d="M6 10h12v10H6V10Z" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </>
  ),
  eyeOff: (
    <>
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
      <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.1 4.1" />
      <path d="M6.6 6.8C3.8 8.6 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  user: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
      <path d="M9 7h3M9 11h3M9 15h3M3 21h18" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  excel: (
    <>
      <path d="M6 3h9l4 4v14H6V3Z" />
      <path d="M15 3v5h4M9 10l5 7M14 10l-5 7" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  fileText: (
    <>
      <path d="M7 3h7l5 5v13H7V3Z" />
      <path d="M14 3v5h5M10 13h5M10 17h5" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  cash: (
    <>
      <path d="M3 7h18v10H3V7Z" />
      <path d="M7 12h.01M17 12h.01M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </>
  ),
  info: (
    <>
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </>
  ),
  paperclip: (
    <path d="m21 11.5-8.6 8.6a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 1 1 5 5l-9.3 9.3a2 2 0 0 1-2.8-2.8l8.4-8.4" />
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrowRight: <path d="M5 12h14M13 5l7 7-7 7" />,
  expand: <path d="M8 3H3v5M21 8V3h-5M3 16v5h5M16 21h5v-5" />,
}

export default function Icon({ name, size = 24, className = '', strokeWidth = 2 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

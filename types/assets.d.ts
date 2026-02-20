// Type declarations for static asset imports (SVG, PNG, JPG, etc.)
// These are handled by Next.js webpack config at runtime,
// but TypeScript needs explicit declarations for type checking.

declare module '*.svg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.png' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpeg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.gif' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.webp' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.ico' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

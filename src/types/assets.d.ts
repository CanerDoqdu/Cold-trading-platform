/**
 * Type declarations for static asset imports.
 * Ensures TypeScript doesn't error on image/SVG imports.
 */

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.jpg' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.jpeg' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.gif' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.webp' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.ico' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module 'memory-cache' {
  function get(key: string): unknown;
  function put(key: string, value: unknown, time?: number): void;
  function del(key: string): void;
  function clear(): void;
  export { get, put, del, clear };
}

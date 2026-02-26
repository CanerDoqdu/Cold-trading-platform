import { z } from 'zod';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const avatarUploadSchema = z.object({
  /** Base64-encoded file content (sans data-uri prefix) */
  file: z.string().min(1, 'File is required'),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    message: 'Only JPEG, PNG, and WebP images are allowed',
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, `File must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
});
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };

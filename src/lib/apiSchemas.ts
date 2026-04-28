import { z } from 'zod';

export const AiScanSchema = z.object({
  ocrText: z.string().min(1).max(120_000),
  categoryId: z.string().min(1).max(64),
});

export const AiHealthSchema = z.object({
  metadata: z.object({
    members: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          relationship: z.string(),
        })
      )
      .max(20),
    documents: z
      .array(
        z.object({
          id: z.string(),
          memberId: z.string(),
          memberName: z.string(),
          title: z.string(),
          categoryId: z.string(),
          emptyFieldKeys: z.array(z.string()),
          nearestExpiryDays: z.number().nullable(),
        })
      )
      .max(500),
  }),
});

export const SharePublishSchema = z.object({
  id: z.string().min(1).max(128),
  cipherB64: z.string().min(1),
  expiresAt: z
    .string()
    .refine((s) => Number.isFinite(Date.parse(s)), { message: 'invalid_expiry' }),
});

export const EmergencyHandoverPublishSchema = SharePublishSchema;

export const EmergencyNotifySchema = z.object({
  to: z
    .string()
    .min(3)
    .refine((s) => s.includes('@'), { message: 'invalid_to' }),
  name: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  link: z.string().optional(),
});

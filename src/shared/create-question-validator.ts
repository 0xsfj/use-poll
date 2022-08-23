import { z } from "zod";

export const createQuestionValidator = z.object({
  question: z.string().min(5).max(500),
  options: z
    .array(z.object({ option: z.string().min(1).max(200) }))
    .min(2)
    .max(20),
});

import { z } from "zod";
import { createRouter } from "./context";

export const questionRouter = createRouter()
  .query("get-all", {
    async resolve({ ctx }) {
      return await ctx.prisma.pollQuestion.findMany();
    },
  })
  .query("get-by-id", {
    input: z.object({ id: z.string() }),
    async resolve({ input }) {
      return await prisma?.pollQuestion.findFirst({
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      question: z.string().min(5).max(500),
    }),
    async resolve({ input }) {
      const newQuestion = await prisma?.pollQuestion.create({
        data: {
          question: input.question,
          options: [],
        },
      });
    },
  });

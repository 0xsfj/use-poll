import { z } from "zod";
import { createRouter } from "./context";
import { TRPCError } from "@trpc/server";

export const questionRouter = createRouter()
  .query("get-all-questions", {
    async resolve({ ctx }) {
      return await ctx.prisma.pollQuestion.findMany();
    },
  })
  .query("get-all-my-questions", {
    async resolve({ ctx }) {
      const sessionToken = ctx.req?.cookies["next-auth.session-token"] ?? "";
      //   console.log(ctx.req?.cookies);

      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return await ctx.prisma.pollQuestion.findMany({
        where: {
          user: {
            sessions: {
              some: {
                sessionToken: {
                  equals: sessionToken,
                },
              },
            },
          },
        },
      });
    },
  })
  .query("get-by-id", {
    input: z.object({ id: z.string() }),
    async resolve({ input, ctx }) {
      const sessionToken = ctx.req?.cookies["next-auth.session-token"] ?? "";

      const questionUser = await ctx.prisma.user.findMany({
        where: {
          sessions: {
            some: {
              sessionToken: {
                equals: sessionToken,
              },
            },
          },
        },
      });

      const isOwnerCheck = questionUser.length ? true : false;

      const question = await prisma?.pollQuestion.findFirst({
        where: {
          id: input.id,
        },
      });
      return { question, isOwner: isOwnerCheck };
    },
  })
  .mutation("create", {
    input: z.object({
      question: z.string().min(5).max(500),
    }),
    async resolve({ input, ctx }) {
      if (!ctx?.session?.user?.id) return { error: "Not authorized" };

      return await prisma?.pollQuestion.create({
        data: {
          question: input.question,
          options: [],
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    },
  });

import { z } from "zod";
import { createRouter } from "./context";
import { TRPCError } from "@trpc/server";
import { createQuestionValidator } from "../../shared/create-question-validator";

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
      const voterToken: string = ctx.req?.cookies["voter-token"] ?? "";

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

      const results = await ctx.prisma.vote.findMany({
        where: {
          questionId: question?.id,
        },
      });

      const votersVote = results.map(
        (vote: { voterToken: string; choice: number }) => {
          return voterToken === vote.voterToken && vote.choice;
        }
      );

      const op = question?.options as unknown as {
        map(arg0: (_option: string, index: number) => number): unknown;
        name: string;
      };

      const resultsCount = op.map((_option: string, index: number) => {
        const count = results.reduce(
          (acc: number, cur: any) => (cur.choice === index ? ++acc : acc),
          0
        );

        return count;
      });

      return {
        question,
        isOwner: isOwnerCheck,
        // results,
        voterResult: votersVote[0],
        resultsCount,
      };
    },
  })
  .mutation("vote-on-question", {
    input: z.object({
      questionId: z.string(),
      option: z.number().min(0).max(100),
    }),
    async resolve({ input, ctx }) {
      const voterToken: string = ctx.req?.cookies["voter-token"] ?? "";

      console.log(voterToken);

      return await prisma?.vote.create({
        data: {
          questionId: input.questionId,
          choice: input.option,
          voterToken: voterToken,
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      questionId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const deleteQuestion = await prisma?.pollQuestion.delete({
        where: {
          id: input.questionId,
        },
      });

      const deleteVotes = await prisma?.vote.deleteMany({
        where: {
          questionId: input.questionId,
        },
      });

      return { deleteQuestion, deleteVotes };
    },
  })
  .mutation("create", {
    input: createQuestionValidator,
    async resolve({ input, ctx }) {
      if (!ctx?.session?.user?.id) return { error: "Not authorized" };

      return await prisma?.pollQuestion.create({
        data: {
          question: input.question,
          options: input.options,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    },
  });

import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Link from "next/link";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { JSONValue } from "superjson/dist/types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Layout from "../components/Layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuestionValidator } from "../shared/create-question-validator";
import toast, { Toaster } from "react-hot-toast";

type FormValues = {
  question: string;
  options: {
    option: string;
  }[];
};

const QuestionCreator = () => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createQuestionValidator),
    defaultValues: {
      options: [{ option: "Yes" }, { option: "No" }],
    },
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      name: "options",
      control,
    }
  );

  const client = trpc.useContext();
  const { mutate } = trpc.useMutation("questions.create", {
    onSuccess: () => {
      client.invalidateQueries(["questions.get-all-my-questions"]);
      toast.custom((t) => (
        <div
          className={`rounded-full bg-white px-6 py-4 shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
        >
          Added Question 👋
        </div>
      ));
      reset();
    },
    onError: () => {
      console.log(`Error`);
    },
  });

  console.log(errors);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate({ question: data.question, options: data.options });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg ">
      <div className="mb-4 w-full">
        <label>
          <input
            placeholder="Question"
            className="w-full rounded-md border-2 border-blue-500  py-2 px-4 selection:bg-slate-50 hover:bg-slate-50"
            {...register("question")}
          />
        </label>
        {errors.question && (
          <p className="rounded-md bg-red-600 py-1 px-2 text-xs text-white">
            {errors.question.message}
          </p>
        )}
      </div>
      <div className="">
        {errors.options && (
          <p className="rounded-md bg-red-600 py-1 px-2 text-xs text-white">
            {errors.options.message}
          </p>
        )}
        {fields.map((field, index) => {
          return (
            <div key={index} className="mb-4 flex w-full align-top">
              <label className="mr-2 w-full">
                <input
                  placeholder="Option"
                  className="w-full rounded-md border-2 border-blue-500 py-2 px-4 selection:bg-slate-50 hover:bg-slate-50"
                  {...register(`options.${index}.option` as const, {
                    required: true,
                  })}
                  key={field.id}
                />
              </label>
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-md border-2 border-red-500 py-2 px-4 uppercase"
              >
                Delete
              </button>
              {errors?.options?.[index]?.option && (
                <p className="rounded-md bg-red-600 py-1 px-2 text-xs text-white">
                  {errors?.options?.[index]?.option?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <button
          className="mr-4 rounded-md border-2 border-blue-500 py-2 px-4 uppercase"
          type="button"
          onClick={() =>
            append({
              option: "",
            })
          }
        >
          Add Question
        </button>
        <button
          type="submit"
          className="rounded-md border-2 border-blue-500 bg-blue-500 py-2 px-4 uppercase text-white"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

interface Question {
  id: string;
  question: string;
  options: {
    option: string;
  }[];
}

const Home: NextPage = () => {
  // const { data: secretMessageData, isLoading: secretMessageIsLoading } =
  //   trpc.useQuery(["question.getSecretMessage"]);

  // const { data: restricted, isLoading: loadingRestricted } = trpc.useQuery([
  //   "question.getSecretMessage",
  // ]);

  // const { data, isLoading } = trpc.useQuery(["questions.get-all-my-questions"]);
  const { data, isLoading } = trpc.useQuery(["questions.get-all-my-questions"]);

  const [questionsRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Layout>
      <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
        Use <span className="text-blue-500">Poll</span>
      </h1>
      <p className="mb-4 text-2xl text-gray-700">Create a Poll</p>
      <QuestionCreator />
      <div
        ref={questionsRef}
        className="mt-3 grid w-full max-w-lg gap-3 pt-3 text-center md:grid-cols-2"
      >
        {data?.map((question) => {
          return (
            <QuestionCard
              key={question.id}
              id={question.id}
              name={question.question}
            />
          );
        })}
      </div>
      <Toaster gutter={30} />
    </Layout>
  );
};

export default Home;

type QuestionCardProps = {
  id: string;
  name: string;
};

const QuestionCard = ({ id, name }: QuestionCardProps) => {
  return (
    <Link href={`/question/${id}`}>
      <a>
        <section className="flex flex-col justify-center rounded border-2 border-gray-500 p-6 shadow-xl duration-500 motion-safe:hover:scale-105">
          <h2 className="text-lg font-bold text-gray-700">{name}</h2>
        </section>
      </a>
    </Link>
  );
};

import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Link from "next/link";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { JSONValue } from "superjson/dist/types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Layout from "../components/Layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuestionValidator } from "../shared/create-question-validator";

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
    // mode: "onBlur",
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
      <div className="w-full">
        <label>
          <input
            placeholder="Question"
            className="border-blue-500 w-full border-2 rounded-md py-2 px-4 hover:bg-slate-50 selection:bg-slate-50 mb-2"
            {...register("question")}
          />
        </label>
        {errors.question && (
          <p className="bg-red-600 text-white text-xs py-1 px-2 rounded-md">
            {errors.question.message}
          </p>
        )}
      </div>
      <div className="">
        {errors.options && (
          <p className="bg-red-600 text-white text-xs py-1 px-2 rounded-md">
            {errors.options.message}
          </p>
        )}
        {fields.map((field, index) => {
          return (
            <div key={index} className="flex w-full">
              <label>
                <input
                  placeholder="Option"
                  className="border-blue-500 w-full border-2 rounded-md py-2 px-4 hover:bg-slate-50 selection:bg-slate-50 mb-2"
                  {...register(`options.${index}.option` as const, {
                    required: true,
                  })}
                  key={field.id}
                />
              </label>
              <button
                type="button"
                onClick={() => remove(index)}
                className="py-2 px-4 rounded-md border-2 border-red-500 uppercase"
              >
                Delete
              </button>
              {errors?.options?.[index]?.option && (
                <p className="bg-red-600 text-white text-xs py-1 px-2 rounded-md">
                  {errors?.options?.[index]?.option?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() =>
          append({
            option: "",
          })
        }
      >
        APPEND
      </button>
      <button
        type="submit"
        className="bg-blue-500 py-2 px-4 rounded-md border-2 border-blue-500 text-white uppercase"
      >
        Submit
      </button>
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

  const { data, isLoading } = trpc.useQuery(["questions.get-all-my-questions"]);

  const [questionsRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <Layout>
      <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
        Use <span className="text-blue-500">Poll</span>
      </h1>
      <p className="text-2xl text-gray-700 mb-4">Create a Poll</p>
      <QuestionCreator />
      <div
        ref={questionsRef}
        className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 w-full max-w-lg"
      >
        {data?.map((question) => {
          return (
            <QuestionCard
              key={question.id}
              id={question.id}
              name={question.question}
              options={question.options}
            />
          );
        })}
      </div>
    </Layout>
  );
};

export default Home;

type QuestionCardProps = {
  id: string;
  name: string;
  options: {
    option: string;
  }[];
};

const QuestionCard = ({ id, name, options }: QuestionCardProps) => {
  console.log(options);

  if (!options) <p>No Options</p>;

  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <Link href={`/question/${id}`}>
        <a>
          <h2 className="text-lg text-gray-700 font-bold">{name}</h2>
        </a>
      </Link>
      {options.map((option, key) => {
        console.log(option);
        return (
          <p key={key} className="text-sm">
            {option.option}
          </p>
        );
      })}
    </section>
  );
};

import type { NextPage } from "next";
import { FC } from "react";
import Head from "next/head";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { JSONValue } from "superjson/dist/types";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type FormValues = {
  question: string;
};

const QuestionCreator: FC = () => {
  const { register, handleSubmit, reset } = useForm<FormValues>();
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

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate({ question: data.question });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        placeholder="Question"
        className="border-blue-500 border-2 rounded-md py-2 px-4 mr-4"
        {...register("question")}
      />
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
  options: JSON;
}

const Home: NextPage = () => {
  const {
    data: sessionData,
    isLoading: sessionIsLoading,
    isError,
  } = trpc.useQuery(["question.getSession"]);

  // const { data: secretMessageData, isLoading: secretMessageIsLoading } =
  //   trpc.useQuery(["question.getSecretMessage"]);

  // const { data: restricted, isLoading: loadingRestricted } = trpc.useQuery([
  //   "question.getSecretMessage",
  // ]);

  const { data, isLoading } = trpc.useQuery(["questions.get-all-my-questions"]);

  const [questionsRef] = useAutoAnimate<HTMLDivElement>();

  console.log(sessionData);

  return (
    <>
      <Head>
        <title>Use Poll</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav>
        <ul className="absolute top-0 left-0 flex p-3 space-x-3 text-white">
          <li>
            <Link href="/">
              <a className="px-2 py-1 bg-blue-500 hover:bg-blue-600 uppercase rounded-md">
                Home
              </a>
            </Link>
          </li>
          <li>
            <Link
              href={!sessionData ? "/api/auth/signin" : "/api/auth/signout"}
            >
              <a className="px-2 py-1 bg-blue-500 hover:bg-blue-600 uppercase rounded-md">
                {!sessionData ? "Sign In" : "Sign Out"}
              </a>
            </Link>
          </li>
        </ul>
        <div className="absolute top-4 right-4 flex flex-col items-center p-4 bg-blue-500 text-white rounded-md">
          {sessionData?.user && (
            <Image
              className="mb-3 w-24 h-24 rounded-full shadow-lg"
              src={sessionData?.user?.image as string}
              alt={sessionData?.user.name as string}
              width={50}
              height={50}
            />
          )}
          <h5 className="mb-1 text-xl font-medium">
            {sessionIsLoading ? "Loading..." : sessionData?.user.name}
          </h5>
          <span className="text-sm text-gray-100 dark:text-gray-400">
            {sessionData?.user.email}
          </span>
        </div>
      </nav>
      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Use <span className="text-blue-500">Poll</span>
        </h1>
        <p className="text-2xl text-gray-700">Create a Poll</p>
        <QuestionCreator />
        <div
          ref={questionsRef}
          className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3"
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
      </main>
    </>
  );
};

export default Home;

type QuestionCardProps = {
  id: string;
  name: string;
  options: string[] | JSONValue;
};

const QuestionCard = ({ id, name, options }: QuestionCardProps) => {
  console.log(options);

  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <Link href={`/question/${id}`}>
        <a>
          <h2 className="text-lg text-gray-700 font-bold">{name}</h2>
        </a>
      </Link>
      {(options as string[])?.map((option: string | number, key) => {
        return (
          <p key={key} className="text-sm">
            {option}
          </p>
        );
      })}
    </section>
  );
};

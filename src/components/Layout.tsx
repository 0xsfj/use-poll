import React from "react";
import { trpc } from "../utils/trpc";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: any) => {
  const {
    data: sessionData,
    isLoading: sessionIsLoading,
    isError,
  } = trpc.useQuery(["question.getSession"]);
  return (
    <>
      <Head>
        <title>Use Poll</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav>
        <ul className="absolute top-0 left-0 flex space-x-3 p-3 text-white">
          <li>
            <Link href="/">
              <a className="rounded-md bg-blue-500 px-2 py-1 uppercase hover:bg-blue-600">
                New Question
              </a>
            </Link>
          </li>
          <li>
            <Link
              href={!sessionData ? "/api/auth/signin" : "/api/auth/signout"}
            >
              <a className="rounded-md bg-blue-500 px-2 py-1 uppercase hover:bg-blue-600">
                {!sessionData ? "Sign In" : "Sign Out"}
              </a>
            </Link>
          </li>
        </ul>
        <div className="absolute top-4 right-4 flex flex-col items-center rounded-md bg-blue-500 p-4 text-white">
          {sessionData?.user && (
            <Image
              className="mb-3 h-24 w-24 rounded-full shadow-lg"
              src={sessionData?.user?.image as string}
              alt={sessionData?.user.name as string}
              width={50}
              height={50}
            />
          )}
          <h5 className="mb-1 text-xl font-medium">
            {sessionIsLoading ? "Loading..." : sessionData?.user.name}
          </h5>
          <span className="text-sm text-gray-100">
            {sessionData?.user.email}
          </span>
        </div>
      </nav>
      <main className="container mx-auto mt-8 flex h-screen flex-col items-center p-4">
        {children}
      </main>
    </>
  );
};

export default Layout;

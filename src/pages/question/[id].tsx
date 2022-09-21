import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { trpc } from "../../utils/trpc";
import toast, { Toaster } from "react-hot-toast";

type Option = {
  option: {
    option: string;
  };
};

const QuestionsPageContent: React.FC<{ id: string }> = ({ id }) => {
  const client = trpc.useContext();
  const router = useRouter();

  const { data, isLoading } = trpc.useQuery(["questions.get-by-id", { id }]);

  const { mutate } = trpc.useMutation("questions.vote-on-question", {
    onSuccess: () => {
      client.invalidateQueries(["questions.get-by-id", { id }]);
      toast.custom((t) => (
        <div
          className={`rounded-full bg-white px-6 py-4 shadow-md ${
            t.visible ? "animate-enter" : "animate-leave"
          }`}
        >
          Added Question 👋
        </div>
      ));
    },
    onError: () => {
      console.log(`Error`);
    },
  });

  const { mutate: mutateDeleteQuestion } = trpc.useMutation(
    "questions.delete",
    {
      onSuccess: () => {
        router.push("/");
      },
      onError: () => {
        console.log(`Error`);
      },
    }
  );

  const vote = (voteId: number) => {
    mutate({ questionId: id, option: voteId });
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!data) {
    return <div>Data Not Found</div>;
  }

  console.log(data);

  const deleteQuestion = () => {
    console.log(`Delete`);
    mutateDeleteQuestion({ questionId: id });
  };

  return (
    <div className="max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white">
      {data?.isOwner && (
        <div className="flex justify-between">
          <p className="text-sm">You Made This</p>
          <button onClick={deleteQuestion} className="text-sm uppercase">
            Delete
          </button>
        </div>
      )}
      <h1 className="text-4xl">{data?.question?.question}</h1>
      <h3 className="mb-4 text-lg">
        Created on: {data?.question?.createdAt.toDateString()}
      </h3>

      <div className="flex flex-col space-y-3">
        {data?.question?.options?.map((option: Option, key: number) => {
          console.log(data.voterResult);

          const disabledCheck =
            data.voterResult === false || !data.voterResult ? false : true;

          console.log(`Disabled: ${disabledCheck}`);

          return (
            <button
              key={key}
              onClick={() => vote(key)}
              className={`rounded-md p-2 ${
                data.voterResult === key
                  ? "bg-red-500"
                  : "bg-slate-100 dark:bg-slate-700"
              }`}
              disabled={disabledCheck}
            >
              {option.option}: {data.resultsCount[key]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const QuestionPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>NO ID</div>;
  }

  return (
    <Layout>
      <QuestionsPageContent id={id} />
    </Layout>
  );
};

export default QuestionPage;

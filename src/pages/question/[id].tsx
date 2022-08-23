import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { trpc } from "../../utils/trpc";

type Option = {
  option: {
    option: string;
  };
};

const QuestionsPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["questions.get-by-id", { id }]);

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!data) {
    return <div>Data Not Found</div>;
  }

  console.log(data);

  return (
    <div className="max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-white p-4">
      {data?.isOwner && <p className="text-sm">You Made This</p>}
      <h1 className="text-4xl">{data?.question?.question}</h1>
      <h3 className="text-lg">
        Created on: {data?.question?.createdAt.toDateString()}
      </h3>

      {data?.question?.options?.map((option: Option, key: number) => {
        console.log(option);

        return <p key={key}>{option.option}</p>;
      })}
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

import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const QuestionsPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["questions.get-by-id", { id }]);

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!data) {
    return <div>Data Not Found</div>;
  }

  return (
    <div>
      {data?.isOwner && <p>You Made This</p>}
      <p>{data?.question?.question}</p>

      {(data?.question?.options as string[])?.map(
        (option: string | number, key) => {
          return <p key={key}>{option}</p>;
        }
      )}
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
    <div>
      <h1 className="text-2xl font-bold">Question</h1>
      <QuestionsPageContent id={id} />
    </div>
  );
};

export default QuestionPage;

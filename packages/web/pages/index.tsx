import type { NextPage } from "next";
import { useQuery } from "react-query";

const Home: NextPage = () => {
  const { data, isLoading } =
    useQuery<Record<string, { description: string }>>("help");

  return (
    <div className="p-4">
      {isLoading
        ? "Loading..."
        : data
        ? Object.entries(data).map(([key, value]) => {
            return (
              <div key={key} className="text-gray-700">
                <span className="font-medium">{key}</span> -{" "}
                <span>{value.description}</span>
              </div>
            );
          })
        : "Something went wrong :("}
    </div>
  );
};

export default Home;

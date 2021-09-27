import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey: [url] }) => {
        if (typeof url === "string") {
          return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`).then(
            (res) => res.json(),
          );
        }
        throw new Error("Invalid query key");
      },
    },
  },
});

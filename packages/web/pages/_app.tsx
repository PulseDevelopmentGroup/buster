import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ReactNode } from "react";
import { QueryClientProvider } from "react-query";
import { queryClient } from "../lib/utils";

function MyApp({ Component, pageProps }: AppProps): ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
export default MyApp;

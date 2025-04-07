import { QueryClient, QueryClientProvider } from "react-query";

/**
 * Sets up the QueryClientProvider from react-query.
 * @param {React.ReactNode} props.children The children components.
 * @returns {React.ReactElement}
 */
export function QueryProvider({ children }) {
  const client = new QueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
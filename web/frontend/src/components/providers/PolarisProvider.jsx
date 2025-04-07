import { useCallback } from "react";
import { AppProvider } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import "@shopify/polaris/build/esm/styles.css";

/**
 * Sets up the AppProvider from Polaris.
 * @param {React.ReactNode} props.children The children components.
 * @returns {React.ReactElement}
 */
export function PolarisProvider({ children }) {
  const navigate = useNavigate();
  const linkComponent = useCallback(
    ({ children, url, ...rest }) => {
      const handleClick = (event) => {
        event.preventDefault();
        navigate(url);
      };

      return (
        <a href={url} onClick={handleClick} {...rest}>
          {children}
        </a>
      );
    },
    [navigate]
  );

  return (
    <AppProvider linkComponent={linkComponent} i18n={{}}>
      {children}
    </AppProvider>
  );
}
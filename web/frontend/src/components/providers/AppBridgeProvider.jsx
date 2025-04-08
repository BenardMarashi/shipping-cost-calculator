import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Provider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";

/**
 * A component to configure App Bridge.
 * @param {Props} props
 * @returns {React.ReactElement}
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [appBridgeConfig, setAppBridgeConfig] = useState(null);
  
  // Get the host and other query params from the URL
  const query = new URLSearchParams(location.search);
  const host = query.get("host");

  useEffect(() => {
    if (!host) {
      console.warn("No host found in query params");
      return;
    }

    const apiKey = window.shopifyApiKey || "15bec6dd27c82c64aa1e66c353f71777";
    
    if (!apiKey) {
      console.error("No API key found");
      return;
    }

    console.log("Initializing AppBridge with:", { host, apiKey });
    
    setAppBridgeConfig({
      host,
      apiKey,
      forceRedirect: true,
    });
  }, [host]);

  const history = useMemo(
    () => ({
      replace: (path) => {
        navigate(path, { replace: true });
      },
    }),
    [navigate]
  );

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location]
  );
  
  if (!appBridgeConfig) {
    console.log("App Bridge config not ready yet");
    return null; // Return null instead of showing an error to avoid flickering during initialization
  }

  return (
    <Provider config={appBridgeConfig} router={routerConfig}>
      {children}
    </Provider>
  );
}
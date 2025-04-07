import React, { useMemo, useState } from "react";
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

  // Get the host from the query parameters
  const query = new URLSearchParams(location.search);
  const host = query.get("host");

  const [appBridgeConfig, setAppBridgeConfig] = useState(null);

  // Create a new app bridge config when the host changes
  useMemo(() => {
    if (!host) {
      return;
    }

    const apiKey = window.shopifyApiKey || import.meta.env.VITE_SHOPIFY_API_KEY || "";

    if (apiKey === "") {
      console.error("Shopify API key is missing");
      return;
    }

    setAppBridgeConfig({
      host,
      apiKey,
      forceRedirect: true,
    });
  }, [host]);

  if (!appBridgeConfig) {
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <div style={{ marginTop: "100px" }}>
              <Banner title="Missing Shopify parameters" status="critical">
                Your app needs to be embedded in a Shopify admin page. Either the API key 
                or the host parameter is missing or invalid.
              </Banner>
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Provider config={appBridgeConfig} router={routerConfig}>
      {children}
    </Provider>
  );
}
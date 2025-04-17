// web/frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .jsx files in /pages will become a route
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", { eager: true });
  
  // Log available pages for debugging
  useEffect(() => {
    console.log("Available page components:", Object.keys(pages));
  }, [pages]);
  
  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            {/* App info for debugging */}
            <div style={{ display: "none" }}>
              {/* This will be hidden but visible in DOM for inspection */}
              <div id="app-debug-info">
                App initialized with {Object.keys(pages).length} page components
                Environment: {import.meta.env.MODE}
                API Key: {window.shopifyApiKey || "Not set"}
              </div>
            </div>
            
            <NavigationMenu
              navigationLinks={[
                {
                  label: "Carriers",
                  destination: "/carriers",
                },
                {
                  label: "Register Service",
                  destination: "/register",
                },
                {
                  label: "Debug",
                  destination: "/debug",
                }
              ]}
            />
            
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
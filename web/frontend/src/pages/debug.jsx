import React from "react";
import { Page, Layout, Card, Text, Banner } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Debug() {
  const app = useAppBridge();
  
  return (
    <Page title="Debug Page">
      <Layout>
        <Layout.Section>
          <Banner
            title="Debug Information"
            status="info"
          >
            <p>This page helps troubleshoot routing issues</p>
          </Banner>
        </Layout.Section>
      
        <Layout.Section>
          <Card title="App Status">
            <Card.Section>
              <Text variant="bodyLg">Current time: {new Date().toLocaleTimeString()}</Text>
              <Text variant="bodyMd">App Bridge connected: {app ? "Yes" : "No"}</Text>
              <Text variant="bodyMd">URL: {window.location.href}</Text>
              <Text variant="bodyMd">App mode: {process.env.NODE_ENV}</Text>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
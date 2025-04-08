import React from "react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";

export default function Register() {
  const fetch = useAuthenticatedFetch();

  const handleRegisterService = async () => {
    try {
      const response = await fetch("/api/register-carrier-service");
      const data = await response.json();
      
      if (data.success) {
        alert("Carrier service registered successfully!");
      } else {
        alert(`Failed to register: ${data.error}`);
      }
    } catch (err) {
      console.error("Error registering carrier service:", err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Page title="Register Carrier Service">
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <Text variant="bodyLg">
                Register your carrier service with Shopify to enable automatic shipping cost calculation at checkout.
              </Text>
            </Card.Section>
            <Card.Section>
              <Button 
                primary 
                onClick={handleRegisterService}
              >
                Register Carrier Service
              </Button>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
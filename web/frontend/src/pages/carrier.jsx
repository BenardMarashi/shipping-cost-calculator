import React, { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  EmptyState,
  Banner,
  Stack,
  Frame
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";

// Simple Carriers page component
export default function Carriers() {
  const fetch = useAuthenticatedFetch();
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load carriers
  const fetchCarriers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/carriers");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch carriers: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Carriers data:", data);
      setCarriers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching carriers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load carriers on component mount
  useEffect(() => {
    fetchCarriers();
  }, []);

  // Handle registering carrier service with Shopify
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
    <Frame>
      <Page
        title="Shipping Carriers"
        primaryAction={{
          content: "Add Carrier",
          onAction: () => alert("Add carrier functionality coming soon!"),
        }}
      >
        {error && (
          <Banner
            title="There was an error loading carriers"
            status="critical"
            onDismiss={() => setError(null)}
          >
            <p>{error}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <Card.Section>
                <Stack distribution="equalSpacing">
                  <Text variant="headingMd">Available Carriers</Text>
                  <Button 
                    primary 
                    onClick={handleRegisterService}
                  >
                    Register Carrier Service
                  </Button>
                </Stack>
              </Card.Section>
              
              <Card.Section>
                {loading ? (
                  <p>Loading carriers...</p>
                ) : carriers.length > 0 ? (
                  <div>
                    {carriers.map((carrier) => (
                      <div 
                        key={carrier.id || carrier.name} 
                        style={{ 
                          padding: "10px", 
                          margin: "10px 0", 
                          border: "1px solid #ddd", 
                          borderRadius: "4px" 
                        }}
                      >
                        <Text variant="bodyMd">
                          <strong>{carrier.name}</strong> - €{(carrier.price / 100).toFixed(2)}
                        </Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    heading="No carriers found"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Add your first shipping carrier to get started.</p>
                  </EmptyState>
                )}
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
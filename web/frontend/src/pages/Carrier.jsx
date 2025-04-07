import { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  ResourceList,
  TextField,
  Button,
  Form,
  FormLayout,
  TextStyle,
  Banner,
  Modal,
  Frame
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";
import { Toast } from "@shopify/app-bridge-react";

export default function Carriers() {
  const fetch = useAuthenticatedFetch();
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCarrier, setNewCarrier] = useState({ name: "", price: "" });
  const [formErrors, setFormErrors] = useState({});
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carrierToDelete, setCarrierToDelete] = useState(null);

  const fetchCarriers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/carriers");
      const data = await response.json();
      setCarriers(data);
    } catch (error) {
      console.error("Error fetching carriers:", error);
      showToast("Failed to load carriers", true);
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  useEffect(() => {
    fetchCarriers();
  }, [fetchCarriers]);

  const handleNewCarrierChange = (field) => (value) => {
    setNewCarrier({ ...newCarrier, [field]: value });
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newCarrier.name.trim()) {
      errors.name = "Carrier name is required";
    }
    
    const price = parseFloat(newCarrier.price);
    if (isNaN(price) || price <= 0) {
      errors.price = "Price must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  };

  const handleAddCarrier = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await fetch("/api/carriers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCarrier.name,
          price: parseInt(newCarrier.price, 10),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCarriers(data.carriers);
        setNewCarrier({ name: "", price: "" });
        showToast("Carrier added successfully");
      } else {
        showToast(data.error, true);
      }
    } catch (error) {
      console.error("Error adding carrier:", error);
      showToast("Failed to add carrier", true);
    }
  };

  const handleDeleteClick = (carrier) => {
    setCarrierToDelete(carrier);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!carrierToDelete) return;
    
    try {
      const response = await fetch(`/api/carriers/${encodeURIComponent(carrierToDelete.name)}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCarriers(data.carriers);
        showToast("Carrier deleted successfully");
      } else {
        showToast(data.error, true);
      }
    } catch (error) {
      console.error("Error deleting carrier:", error);
      showToast("Failed to delete carrier", true);
    } finally {
      setDeleteModalOpen(false);
      setCarrierToDelete(null);
    }
  };

  const handleUpdatePrice = async (carrier, newPrice) => {
    const price = parseInt(newPrice, 10);
    
    if (isNaN(price) || price <= 0) {
      showToast("Price must be a positive number", true);
      return;
    }
    
    try {
      const response = await fetch(`/api/carriers/${encodeURIComponent(carrier.name)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCarriers(data.carriers);
        showToast("Carrier price updated successfully");
      } else {
        showToast(data.error, true);
      }
    } catch (error) {
      console.error("Error updating carrier:", error);
      showToast("Failed to update carrier", true);
    }
  };

  const renderItem = (item) => {
    const [editPrice, setEditPrice] = useState(item.price.toString());
    const [isEditing, setIsEditing] = useState(false);
    
    const handleEditStart = () => {
      setEditPrice(item.price.toString());
      setIsEditing(true);
    };
    
    const handleEditCancel = () => {
      setIsEditing(false);
    };
    
    const handleEditSave = () => {
      handleUpdatePrice(item, editPrice);
      setIsEditing(false);
    };
    
    return (
      <ResourceList.Item id={item.id}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h3><TextStyle variation="strong">{item.name}</TextStyle></h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isEditing ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <TextField
                  value={editPrice}
                  onChange={(value) => setEditPrice(value)}
                  autoComplete="off"
                  type="number"
                  min="0"
                  prefix="€"
                  suffix="cents"
                />
                <Button size="slim" onClick={handleEditSave}>Save</Button>
                <Button size="slim" onClick={handleEditCancel}>Cancel</Button>
              </div>
            ) : (
              <>
                <TextStyle>€{(item.price / 100).toFixed(2)}</TextStyle>
                <Button size="slim" onClick={handleEditStart}>Edit Price</Button>
                <Button size="slim" destructive onClick={() => handleDeleteClick(item)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </ResourceList.Item>
    );
  };

  return (
    <Frame>
      <Page title="Shipping Carriers">
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <Form onSubmit={handleAddCarrier}>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Carrier Name"
                      value={newCarrier.name}
                      onChange={handleNewCarrierChange("name")}
                      error={formErrors.name}
                      autoComplete="off"
                    />
                    <TextField
                      label="Price (cents)"
                      value={newCarrier.price}
                      onChange={handleNewCarrierChange("price")}
                      type="number"
                      min="0"
                      error={formErrors.price}
                      helpText="Price in cents (e.g. 1000 = €10.00)"
                      prefix="€"
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <Button primary submit>Add Carrier</Button>
                </FormLayout>
              </Form>
            </LegacyCard>
          </Layout.Section>

          <Layout.Section>
            <LegacyCard>
              <ResourceList
                resourceName={{ singular: "carrier", plural: "carriers" }}
                items={carriers}
                renderItem={renderItem}
                loading={loading}
                emptyState={
                  <Banner
                    title="No carriers found"
                    action={{ content: "Add a carrier", onAction: () => {} }}
                  >
                    <p>Add your first shipping carrier to get started.</p>
                  </Banner>
                }
              />
            </LegacyCard>
          </Layout.Section>
        </Layout>

        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}

        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Carrier"
          primaryAction={{
            content: "Delete",
            onAction: handleDeleteConfirm,
            destructive: true,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setDeleteModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <p>
              Are you sure you want to delete the carrier "{carrierToDelete?.name}"? 
              This action cannot be undone.
            </p>
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
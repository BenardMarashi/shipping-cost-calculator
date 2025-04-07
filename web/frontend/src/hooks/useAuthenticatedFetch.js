import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

/**
 * A hook that returns an authenticatedFetch function.
 * @desc The authenticatedFetch function adds the necessary headers to make authenticated requests to the Shopify API.
 * @returns {Function} The authenticatedFetch function.
 */
export function useAuthenticatedFetch() {
  const app = useAppBridge();
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);
    
    if (response.status === 401) {
      const authUrlHeader = response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");
      
      if (authUrlHeader) {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, authUrlHeader);
        return null;
      }
    }
    
    return response;
  };
}
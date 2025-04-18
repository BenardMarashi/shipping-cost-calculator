import { Routes as ReactRouterRoutes, Route, Navigate } from "react-router-dom";

/**
 * File-based routing.
 * @param {*} pages
 * @returns {JSX.Element}
 */
export default function Routes({ pages }) {
  const routes = useRoutes(pages);

  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ));

  return (
    <ReactRouterRoutes>
      {/* Default root path redirects to Carriers page */}
      <Route path="/" element={<Navigate to="/carriers" replace />} />
      
      {routeComponents}
      <Route path="*" element={<NotFound />} />
    </ReactRouterRoutes>
  );
}

function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

function useRoutes(pages) {
  console.log("Available pages:", Object.keys(pages));
  
  const routes = Object.keys(pages)
    .map((key) => {
      let path = key
        .replace("./pages", "")
        .replace(/\.(t|j)sx?$/, "")
        .replace(/\/index$/i, "/")
        .replace(/\b[A-Z]/, (match) => match.toLowerCase());

      console.log(`Converting ${key} to route: ${path}`);
      
      if (path.endsWith("/")) {
        path = path.substring(0, path.length - 1);
      }

      return {
        path,
        component: pages[key].default,
      };
    })
    .filter((route) => route.component);

  return routes;
}
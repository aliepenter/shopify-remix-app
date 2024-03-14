import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server";
import { getPrisma } from "~/api/prisma.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
        query shopInfo {
          shop {
              name
          }
      }`,

  );
  const responseJson = await response.json();

  const data = await getPrisma(responseJson.data.shop.name);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "", data });
};

export default function App() {
  const { apiKey, data } = useLoaderData<typeof loader>();
  // Check dynamic cho themeName
  return (
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <ui-nav-menu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/customizeDiscount">Customize discount block</Link>
          {(data?.themeAuthor === "Blueskytechco" || data?.themeAuthor === "Blueskytechco Theme") && data?.themeName === "Glimo" ? <Link to="/app/bluesky">Blueskytechco themes</Link> : null}
          <Link to="/app/settings">Settings</Link>
        </ui-nav-menu>
        <Outlet />
      </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

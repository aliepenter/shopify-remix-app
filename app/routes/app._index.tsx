import { useCallback, useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Banner,
  ProgressBar,
  InlineGrid,
  Divider,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { SetupTasks } from "~/components/SetupTasks";
import { createPrisma, getPrisma, updatePrismaAuthor } from "~/api/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const themes = await admin.rest.resources.Theme.all({
    session: session,
  });
  const mainTheme = themes.data.find(theme => theme.role === 'main');

  const response = await admin.graphql(
    `#graphql
        query shopInfo {
          shop {
              name
              url
              myshopifyDomain
              email
              contactEmail
          }
      }`,

  );
  const responseJson = await response.json();
  const storeDomain = responseJson.data.shop.name;
  const theme = await admin.rest.resources.Asset.all({
    session: session,
    theme_id: mainTheme?.id,
    asset: { "key": "config/settings_schema.json" },
  });
  const valueString = `${theme.data[0].value}`
  const valueJson = JSON.parse(valueString);

  await createPrisma({
    themeAuthor: "",
    email: responseJson.data.shop.email,
    storeName: responseJson.data.shop.name,
    author: valueJson[0].theme_author,
    themeName: valueJson[0].theme_name,
    themeId: mainTheme?.id?.toString(),
  });
  const data = await getPrisma(storeDomain);

  const themeId = data?.themeId ? data?.themeId : mainTheme?.id;

  const themeCheckEmbed = await admin.rest.resources.Asset.all({
    session: session,
    theme_id: mainTheme?.id,
    asset: { "key": "config/settings_data.json" },
  });
  const themeCheckEmbedString = `${themeCheckEmbed.data[0].value}`
  const themeCheckEmbedJson = JSON.parse(themeCheckEmbedString);
  let embedStatus: boolean = false;
  let customizeStatus = data?.customizeStatus;
  for (const key in themeCheckEmbedJson.current.blocks) {
    if (themeCheckEmbedJson.current.blocks.hasOwnProperty(key)) {
      const item = themeCheckEmbedJson.current.blocks[key];
      if (item.type.includes("bluesky-toolkit")) {
        embedStatus = !item.disabled;
      }
    }
  }
  await updatePrismaAuthor({
    enableAppEmbed: embedStatus,
    storeName: responseJson.data.shop.name
  });
  const storeUrl = responseJson.data.shop.myshopifyDomain
  return { themeId, storeDomain, embedStatus, customizeStatus, storeUrl };

};

export default function Index() {
  const { themeId, storeDomain, embedStatus, customizeStatus, storeUrl } = useLoaderData<typeof loader>();
  const urlEmbed = `https://admin.shopify.com/store/${storeDomain}/themes/${themeId}/editor?context=apps`;
  let progress = 0;
  let finishTask = 0;
  if ((embedStatus !== false && customizeStatus === false) || (embedStatus === false && customizeStatus !== false)) {
    progress = 50;
    finishTask = 1;
  } else if (embedStatus === true && embedStatus === true) {
    progress = 100;
    finishTask = 2;
  }

  return (
    <Page>
      <BlockStack gap="400">
        <Layout>
          <Layout.Section>
            <BlockStack gap="050">
              <Text as="p" variant="headingXl">
                Hi {storeUrl} 👋
              </Text>
              <Text as="p" variant="bodyMd">
                Welcome to Discount Master Pro
              </Text>
            </BlockStack>
          </Layout.Section>
          {
            embedStatus
              ?
              null
              :
              <Layout.Section>
                <Banner
                  title="Enable App Embed"
                  tone="warning"
                >
                  <BlockStack gap="400">
                    <Text as="p" variant="bodyMd">
                      Before you continue please enable the Blueskytechco’s embedded block on your live theme. This enables us to replace your subtotal line with an optimized cart summary widget on your cart page or drawer cart.
                    </Text>
                    <InlineStack align="start">
                      <Button url={urlEmbed} target="_blank">
                        Enable app embed
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Banner>
              </Layout.Section>
          }

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Setup guide
                  </Text>
                  <InlineGrid gap="500" alignItems="center" columns={"auto 1fr"}>
                    <Text as="p" variant="bodyMd">
                      {finishTask} of 2 tasks complete
                    </Text>
                    <ProgressBar progress={progress} size="small" />
                  </InlineGrid>
                </BlockStack>
                <Divider />
                <SetupTasks
                  isChecked={embedStatus ? true : false}
                  subdescription={embedStatus ? "" : "Add Discount Block to your cart page. Don't worry, our app does not leave any files in your theme. All changes will be removed when app be uninstalled."}
                  description={embedStatus ? "" : "A clean & safe install for your active theme."}
                  title="Step 1: Online store dashboard"
                  buttonTitle={embedStatus ? "" : "Enable app embed"}
                >
                </SetupTasks>
                <SetupTasks
                  isChecked={customizeStatus ? true : false}
                  subdescription="Customize your Discount Block appearance. Edit labels, fonts, button size & colors to match your theme."
                  title="Step 2: Customize Discount Block"
                  buttonTitle="Customize Block"
                  buttonUrl="/app/customizeDiscount"
                >
                </SetupTasks>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
    // <Page>
    //   <BlockStack gap="400">
    //     <Layout>
    //       <Layout.Section>
    //         <BlockStack gap="050">
    //           <Text as="p" variant="headingXl">
    //             Hi bluesky.myshopify.com 👋
    //           </Text>
    //           <Text as="p" variant="bodyMd">
    //             Welcome to Bluesky Toolkit
    //           </Text>
    //         </BlockStack>
    //       </Layout.Section>
    //       {/* <Layout.Section>
    //         <Banner
    //           title="Enable App Embed"
    //           tone="warning"
    //           action={{ content: 'Enable app embed', url: '' }}
    //           onDismiss={() => { }}
    //         >
    //           <Text as="p" variant="bodyMd">
    //             Before you continue please enable the Blueskytechco’s embedded block on your live theme. This enables us to replace your subtotal line with an optimized cart summary widget on your cart page or drawer cart.
    //           </Text>
    //         </Banner>
    //       </Layout.Section> */}
    //       <Layout.Section>
    //         <Card>
    //           <SetupTasks
    //             subdescription="Add Discount Block to your cart page. Don't worry, our app does not leave any files in your theme. All changes will be removed when app be uninstalled."
    //             description="A clean & safe install for your active theme."
    //             title="Step 1: Online store dashboard"
    //           >
    //           </SetupTasks>
    //         </Card>
    //       </Layout.Section>
    //       <Layout.Section>
    //         <Card>
    //           <SetupTasks
    //             subdescription="Customize your Discount Block appearance. Edit labels, fonts, button size & colors to match your theme."
    //             title="Step 2: Customize Discount Block"
    //             buttonTitle="Customize Block"
    //             buttonUrl="/app/customizeDiscount"
    //           >
    //           </SetupTasks>
    //         </Card>
    //       </Layout.Section>
    //     </Layout>
    //   </BlockStack>
    // </Page>
  );
}
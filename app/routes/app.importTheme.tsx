import {
    Card,
    Layout,
    Page,
    Text,
    BlockStack,
    Button,
    InlineGrid,
    InlineStack,
    Banner,
    Checkbox
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { PreviewItems } from "~/components/PreviewItems";
import { getPrisma, getThemes } from "~/api/prisma.server";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

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

    const userSession = await getPrisma(responseJson.data.shop.name);

    const data = await getThemes(userSession?.themeName ? userSession?.themeName : "");
    return { data };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const data = await getThemes("Umino");

    const formData = await request.formData();
    const id = formData.get("id") || "0";
    const themeToImport = typeof id === "string" ? data.find(theme => theme.id === parseInt(id)) : null;
    if (themeToImport !== null) {
        const theme = new admin.rest.resources.Theme({ session: session });
        theme.name = themeToImport?.themeName || "";
        theme.src = themeToImport?.themeFolderPath || "";
        theme.role = "main";
        try {
            await theme.save({
                update: true,
            });
            return json({
                status: "success",
            });
        } catch (error) {
            return json({
                status: "error",
                error: error
            });
        }
    }
    return null;
}

export default function ImportTheme() {
    const submit = useSubmit();
    const { data } = useLoaderData<typeof loader>();
    const [checked, setChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<number>(0);
    const handleSelect = (id: number) => {
        setSelected(id);
    };
    const actionData = useActionData<typeof action>();

    const handleImportTheme = (id: number) => {
        const formData = new FormData();
        formData.append("id", id.toString());
        submit(formData, { replace: true, method: "POST" })
        setIsLoading(true);
    };
    useEffect(() => {
        if (actionData?.status === "success") {
            setTimeout(() => {
                setChecked(false);
                setSelected(0);
                setIsLoading(false);
                shopify.toast.show('Import Theme Successfully!');
            }, 3000);
        } else if (actionData?.status === "error") {
            setTimeout(() => {
                setChecked(false);
                setSelected(0);
                setIsLoading(false);
                shopify.toast.show('Import Theme Fail!', {
                    isError: true
                });
            }, 3000);
        }
    }, [actionData]);

    const handleChange = useCallback(
        (newChecked: boolean) => setChecked(newChecked),
        [],
    );

    return (
        <Page
            title="Import Blueskytechco Demo Theme"
            subtitle="Quickly import Blueskytechco Demo Theme by just one click."
            backAction={{ url: '/app/bluesky' }}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <InlineGrid columns={{ xs: 2, md: 3 }} gap="400">
                            {
                                data.map((item) => (
                                    <PreviewItems
                                        key={item.id}
                                        itemId={item.id}
                                        previewUrl={item.themePreviewUrl || ""}
                                        imageAlt={item.themeName || ""}
                                        imageSrc={item.themePreviewImageUrl || ""}
                                        selectedItem={selected}
                                        onClickButton={() => handleSelect(item.id)}
                                    />
                                ))
                            }
                        </InlineGrid>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Banner
                        title="Before you import demo"
                        tone="warning"
                    >
                        <BlockStack gap="400">
                            <Text as="p" variant="bodyMd">
                                Demo imported here will be added to the theme selected in app settings. Make sure you choose an unpublished Shopify theme while importing demo. After import, your theme will resemble the demo, except that all images can be blank (due to copyright). You need to replace blank images into yours.
                            </Text>
                            <Checkbox
                                label="I have understood the information above and agree to import the demo."
                                checked={checked}
                                onChange={handleChange}
                            />
                            <InlineStack align="start">
                                <Button
                                    loading={isLoading ? true : false}
                                    onClick={() => handleImportTheme(selected)}
                                    variant="primary"
                                    disabled={selected && selected !== 0 && checked !== false ? false : true}
                                >
                                    Import Demo
                                </Button>
                            </InlineStack>
                        </BlockStack>
                    </Banner>
                </Layout.Section>
            </Layout>
        </Page>
    );

}
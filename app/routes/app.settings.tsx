import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
    Card,
    Layout,
    Page,
    Text,
    BlockStack,
    TextField,
    Select,
    Form,
    Button,
    InlineStack
} from "@shopify/polaris";
import { useState, useCallback } from 'react';
import { createPrisma, getPrisma, updatePrismaAuthor } from "~/api/prisma.server";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const themes = await admin.rest.resources.Theme.all({
        session: session,
    });
    const mainTheme = themes.data.find(theme => theme.role === 'main');
    const notDemoTheme = themes.data.filter(theme => theme.role !== 'demo' && theme.role !== 'development');

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
    const storeEmail = responseJson.data.shop.email;
    const data = await getPrisma(responseJson.data.shop.name);

    return { notDemoTheme, mainTheme, storeEmail, data };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const response = await admin.graphql(
        `#graphql
          query shopInfo {
            shop {
                name
            }
        }`,

    );
    const responseJson = await response.json();
    const formdata = await request.formData();
    const themeName = formdata.get("themeName")?.toString();
    if (themeName) {
        const themeId = parseInt(themeName);
        const theme = await admin.rest.resources.Asset.all({
            session: session,
            theme_id: themeId,
            asset: { "key": "config/settings_schema.json" },
        });
        const valueString = `${theme.data[0].value}`
        const valueJson = JSON.parse(valueString);
        await updatePrismaAuthor({
            author: valueJson[0].theme_author,
            themeId: themeName,
            themeName: valueJson[0].theme_name,
            storeName: responseJson.data.shop.name
        });
        return json({
            data: valueJson[0].theme_author
        });
    } else {
        return null;
    }
};


export default function Settings() {
    
    const { notDemoTheme, mainTheme, storeEmail, data } = useLoaderData<typeof loader>();
    const [selected, setSelected] =  useState(data?.themeId?data?.themeId:mainTheme?.id.toString());
    
    const options = notDemoTheme.map(theme => ({
        label: theme.name,
        value: theme.id.toString(),
    }));

    const handleSelectChange = useCallback(
        (value: string) => setSelected(value),
        [],
    );
    
    const submit = useSubmit();

    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        submit(formData, { method: "post" });
    }, [submit]);
    return (
        <Page title="General">
            <Form onSubmit={handleSubmit}>
                <Layout>
                    <Layout.AnnotatedSection
                        id="storeDetails"
                        title="Store details"
                        description="Configure your account information and more."
                    >
                        <BlockStack gap="400">
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">

                                    <BlockStack gap="200">
                                        <Select
                                            label="Choose a theme to add extension"
                                            id="themeName"
                                            name="themeName"
                                            options={options}
                                            onChange={handleSelectChange}
                                            value={selected}
                                        />
                                        <Text as="p" variant="bodyMd">
                                            Select a theme to use Bluesky Toolkit. By default, apps will be added to your live theme
                                        </Text>
                                    </BlockStack>
                                    <BlockStack gap="200">
                                        <TextField autoComplete="off" label="Account email" disabled value={storeEmail} />
                                        <Text as="p" variant="bodyMd">
                                            Email that receives app updates from us
                                        </Text>
                                    </BlockStack>

                                </BlockStack>
                            </Card>
                            <InlineStack align="end">
                                <Button variant="primary" submit>Save</Button>
                            </InlineStack>
                        </BlockStack>
                    </Layout.AnnotatedSection>
                </Layout>

            </Form>
        </Page>
    );
}

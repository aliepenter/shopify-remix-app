import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    Card,
    Layout,
    Page,
    Text,
    BlockStack,
    PageActions,
    Button,
    InlineGrid,
    InlineStack,
    Banner,
    Checkbox,
    Divider,
    Badge
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { getPrisma, getUpdateStatus } from "~/api/prisma.server";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
  
    const data = await getPrisma(responseJson.data.shop.name);
    const updateStatus = await getUpdateStatus();

    const theme = await admin.rest.resources.Asset.all({
        session: session,
        theme_id: data?.themeId,
        asset: { "key": "config/settings_schema.json" },
    });

    const asset = await admin.rest.resources.Asset.all({
        session: session,
        theme_id: data?.themeId,
    });
    const valueString = `${theme.data[0].value}`
    const valueJson = JSON.parse(valueString);

    return json({
        data: {
            "theme_version": valueJson[0].theme_version,
        },
        updateStatus,
        asset
    });
};


// export const action = async ({ request }: ActionFunctionArgs) => {
//     const { admin, session } = await authenticate.admin(request);
//     const data = await getThemes();

//     const formData = await request.formData();
//     const id = formData.get("id") || "0";
//     const themeToImport = typeof id === "string" ? data.find(theme => theme.id === parseInt(id)) : null;
//     if (themeToImport !== null) {
//         const theme = new admin.rest.resources.Theme({ session: session });
//         theme.name = themeToImport?.themeName || "";
//         theme.src = themeToImport?.themeFolderPath || "";
//         theme.role = "main";
//         try {
//             await theme.save({
//                 update: true,
//             });
//             return json({
//                 status: "success",
//             });
//         } catch (error) {
//             return json({
//                 status: "error",
//                 error: error
//             });
//         }
//     }
//     return null;
// }

function parseISOString(s: any) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

export default function UpdateTheme() {
    const { data, updateStatus, asset } = useLoaderData<typeof loader>();
    const date = parseISOString(updateStatus?.date);
    const localeJsonFile = asset.data.filter(x => x.content_type === "application/json" && x.key.includes("locales/"));
    const configJsonFile = asset.data.filter(x => x.content_type === "application/json" && x.key.includes("config/settings_data.json"));
    const sectionJsonFile = asset.data.filter(x => x.content_type === "application/json" && x.key.includes("sections/"));
    const templateJsonFile = asset.data.filter(x => x.content_type === "application/json" && x.key.includes("templates/"));
    const allJsonFiles = asset.data.filter(x => x.content_type === "application/json" && !x.key.includes("config/settings_schema.json")).map(obj => obj.key);;


    const [checked, setChecked] = useState<string[]>([]);
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);

    const handleSelectAllChange = () => {
        if (!selectAllChecked) {
            setChecked([...allJsonFiles]);
        } else {
            setChecked([]);
        }
        setSelectAllChecked(!selectAllChecked);
    };

    const handleChange = (value: string, c: boolean) => {
        if (c) {
            setChecked([...checked, value]);
        } else {
            setChecked(checked.filter(item => item !== value));
        }
    }

    const currentVersion = data.theme_version ? data.theme_version : "1.0.0";
    const latestVersion = updateStatus && updateStatus.version ? updateStatus.version.toString() : "1.0.0";


    const [updateStatusChecking, setUpdateStatusChecking] = useState<boolean>(false);

    useEffect(() => {
        setUpdateStatusChecking(currentVersion !== latestVersion);
    }, [currentVersion, latestVersion]);

    return (
        <Page
            title="Update theme"
            subtitle="Easily update your theme latest version just in a single click."
            backAction={{ url: '/app/bluesky' }}
        >
            <Layout>
                <Layout.Section>
                    <Banner
                        title="Before you update theme version"
                        tone="warning"
                    >
                        <BlockStack gap="400">
                            <Text as="p" variant="bodyMd">
                                Update your theme to the latest version will not keep any custom code modifications in liquid files.
                            </Text>
                        </BlockStack>
                    </Banner>
                </Layout.Section>
                <Layout.Section>
                    <Banner title={updateStatusChecking ? "New update version available!" : "Your theme is up to date!"} >
                        <BlockStack gap="400">
                            <InlineGrid columns={"1fr 5fr"}>
                                <Text as="p" variant="bodyMd">
                                    Current version
                                </Text>
                                <Text as="p" variant="bodyMd">
                                    <Badge tone="info">
                                        {currentVersion}
                                    </Badge>
                                </Text>
                            </InlineGrid>
                            <Divider />
                            <InlineGrid columns={"1fr 5fr"}>
                                <Text as="p" variant="bodyMd">
                                    Latest version
                                </Text>
                                <Text as="p" variant="bodyMd">
                                    <Badge tone="success">
                                        {latestVersion}
                                    </Badge>
                                </Text>
                            </InlineGrid>
                        </BlockStack>
                    </Banner>
                </Layout.Section>
                <Layout.Section>
                    <Banner title="Change logs" tone="success">
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                                {`Version ${updateStatus ? updateStatus.version : "1.0.0"} releases on ${date}`}
                            </Text>
                            <Text as="p" variant="bodyMd">
                                {updateStatus ? updateStatus.changeLogs : "1.0.0"}
                            </Text>
                            <InlineStack align="start">
                                <Button url={updateStatus && updateStatus.changeLogLink ? updateStatus.changeLogLink : "#"}> View All </Button>
                            </InlineStack>
                        </BlockStack>
                    </Banner>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text as="p" variant="headingMd">
                                Select config file to copy to new theme version
                            </Text>
                            {
                                configJsonFile.map((item, index) => (
                                    <Checkbox
                                        key={index}
                                        label={item.key}
                                        checked={checked.includes(item.key)}
                                        onChange={(newVal) => handleChange(item.key, newVal)}
                                    />
                                ))
                            }
                            <Text as="p" variant="headingMd">
                                Select pages to copy to new theme version
                            </Text>
                            {
                                templateJsonFile.map((item, index) => (
                                    <Checkbox
                                        key={index}
                                        label={item.key}
                                        checked={checked.includes(item.key)}
                                        onChange={(newVal) => handleChange(item.key, newVal)}
                                    />
                                ))
                            }
                            <Text as="p" variant="headingMd">
                                Select language files to copy to new theme version
                            </Text>
                            {
                                localeJsonFile.map((item, index) => (
                                    <Checkbox
                                        key={index}
                                        label={item.key}
                                        checked={checked.includes(item.key)}
                                        onChange={(newVal) => handleChange(item.key, newVal)}
                                    />
                                ))
                            }
                            <Text as="p" variant="headingMd">
                                Select other files to copy to new theme version
                            </Text>
                            {
                                sectionJsonFile.map((item, index) => (
                                    <Checkbox
                                        key={index}
                                        label={item.key}
                                        checked={checked.includes(item.key)}
                                        onChange={(newVal) => handleChange(item.key, newVal)}
                                    />
                                ))
                            }

                            <InlineStack align="start">
                                <Button onClick={handleSelectAllChange}> Select All </Button>
                            </InlineStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <InlineStack align="start">
                        <Button
                            variant="primary"
                            disabled={updateStatusChecking ? false : true}
                        >
                            {updateStatusChecking ? "Update Theme" : "Your Theme Is Up To Date"}
                        </Button>
                    </InlineStack>
                </Layout.Section>
                <Layout.Section></Layout.Section>
            </Layout>
        </Page>
    );

}
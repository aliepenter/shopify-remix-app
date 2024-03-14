import {
    Banner,
    BlockStack,
    Button,
    Card,
    Icon,
    InlineGrid,
    InlineStack,
    Layout,
    Link,
    Page,
    Text,
    TextField
} from "@shopify/polaris";

import {
    UploadIcon,
    ImportIcon
} from '@shopify/polaris-icons';

export default function Bluesky() {
    return (
        <Page>
            <BlockStack gap="400">
                <Layout>
                    <Layout.Section>
                        <InlineGrid columns={{ xs: "1fr", md: "1fr 1fr" }} gap="400">
                            <Card>
                                <InlineGrid columns={"1fr 2fr"}>
                                    <Icon
                                        source={ImportIcon}
                                        tone="base"
                                        accessibilityLabel="Install theme"
                                    />
                                    <BlockStack gap="400">
                                        <Text as="h2" variant="headingMd">
                                            Install Theme
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Quickly import your theme demos into your online store just in a single click.
                                        </Text>
                                        <InlineStack align="start">
                                            <Button
                                                variant="primary"
                                                url="/app/importTheme"
                                            >
                                                Explore
                                            </Button>
                                        </InlineStack>
                                    </BlockStack>
                                </InlineGrid>
                            </Card>
                            <Card>
                                <InlineGrid columns={"1fr 2fr"}>
                                    <Icon
                                        source={UploadIcon}
                                        tone="base"
                                        accessibilityLabel="Update theme"
                                    />
                                    <BlockStack gap="400">
                                        <Text as="h2" variant="headingMd">
                                            Update Theme
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Easily update your theme latest version just in a single click.
                                        </Text>
                                        <InlineStack align="start">
                                            <Button
                                                variant="primary"
                                                url="/app/updateTheme"
                                            >
                                                Explore
                                            </Button>
                                        </InlineStack>
                                    </BlockStack>
                                </InlineGrid>
                            </Card>
                        </InlineGrid>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
}

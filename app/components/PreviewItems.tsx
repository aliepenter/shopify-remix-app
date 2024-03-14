import {
    Text,
    BlockStack,
    Button,
    InlineStack,
    Box,
    Link,
} from "@shopify/polaris";


type PreviewItemProps = {
    itemId: number;
    imageSrc: string;
    imageAlt: string;
    previewUrl: string;
    selectedItem?: number;
    onClickButton: () => void;
}

export function PreviewItems({ itemId, imageSrc, imageAlt, previewUrl, selectedItem, onClickButton }: PreviewItemProps) {
    return (
        <BlockStack gap="300">
            <Box>
                <div className="preview-demo-image">
                    <img src={imageSrc} alt={imageAlt} />
                </div>
            </Box>
            <Text as="h2" variant="headingMd">
                {imageAlt}
            </Text>
            <InlineStack align="start" blockAlign="center" gap="200">
                <Button
                    variant={selectedItem != itemId ? "secondary" : "primary"}
                    onClick={onClickButton}
                >
                    {selectedItem != itemId ? "Select" : "Selected"}
                </Button>
                <Link target="_blank" url={previewUrl}>Preview</Link>
            </InlineStack>
        </BlockStack>
    );
}
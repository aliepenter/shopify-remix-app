import {
    Text,
    BlockStack,
    Icon,
    InlineGrid,
    Button,
    InlineStack,
} from "@shopify/polaris";

const iconNotChecked = () => {
    return (
        <svg viewBox="0 0 20 20" fill="none" focusable="false">
            <circle cx="10" cy="10" r="8.75" fill="none" stroke="#BABEC3" strokeWidth="2.5" strokeDasharray="3.5 3.5">
            </circle>
        </svg>
    );
};
const iconChecked = () => {
    return (
        <svg viewBox="0 0 20 20" focusable="false">
            <path fillRule="evenodd" d="M0 10a10 10 0 1 0 20 0 10 10 0 0 0-20 0zm15.2-1.8a1 1 0 0 0-1.4-1.4l-4.8 4.8-2.3-2.3a1 1 0 0 0-1.4 1.4l3 3c.4.4 1 .4 1.4 0l5.5-5.5z">
            </path>
        </svg>
    );
};

type SetupTasksProps = {
    isChecked: boolean;
    description?: string;
    subdescription?: string;
    title: string;
    buttonTitle?: string;
    buttonUrl?: string;
}

export function SetupTasks({ isChecked, title, description, subdescription, buttonTitle, buttonUrl }: SetupTasksProps) {
    return (
        <InlineGrid columns={{ xs: "1fr auto", md: "auto 1fr auto" }} alignItems="start" gap='400'>
            <div>
                <Icon source={isChecked ? iconChecked : iconNotChecked} tone={isChecked ? "success" : "base"} />
            </div>
            <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                    {title}
                </Text>
                <BlockStack gap="200">
                    {
                        description ?
                            <Text as="p" variant="bodyMd">
                                {description}
                            </Text> : null
                    }
                    {
                        subdescription ?
                            <Text as="p" variant="bodyMd">
                                {subdescription}
                            </Text> : null
                    }
                </BlockStack>
                {
                    buttonTitle ?
                        <InlineStack align="start">
                            <Button
                                url={buttonUrl ? buttonUrl : "#"}
                            >
                                {buttonTitle}
                            </Button>
                        </InlineStack>
                        :
                        null
                }

            </BlockStack>
            {isChecked && buttonTitle == "" ? null : <img className="responsive-img" src="https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/customize-theme-task-d2760705452ef967a48b5fc4a6dce1ea9fc2fe4566dea18bb0927a746abb349f.svg" alt="Logo" />}
        </InlineGrid>
    );
}
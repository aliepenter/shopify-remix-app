import { LoaderFunctionArgs } from "@remix-run/node";
import {
    Card,
    Layout,
    Page,
    Text,
    BlockStack,
    TextField,
    Select,
    Button,
    ColorPicker,
    InlineGrid,
    InlineStack,
    Popover,
    RangeSlider
} from "@shopify/polaris";
import { useState, useCallback } from 'react';
import { updatePrismaAuthor } from "~/api/prisma.server";
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

    await updatePrismaAuthor({
        customizeStatus: true,
        storeName: responseJson.data.shop.name
    });
    return {};

};

export default function CustomizeDiscount() {
    const [selected, setSelected] = useState('left');

    
    const [fieldBorderRadius, setFieldBorderRadius] = useState(20);

    const handleChangeRangeBorderRadius = useCallback(
        (value: number) => setFieldBorderRadius(value),
        [],
    );

    const [buttonTextFs, setButtonTextFs] = useState(20);

    const handleChangeButtonTextFs = useCallback(
        (value: number) => setButtonTextFs(value),
        [],
    );

    const [btnColor, setBtnColor] = useState({
        hue: 0,
        brightness: 1,
        saturation: 0,
    });

    const [btnTextColor, setBtnTextColor] = useState({
        hue: 0,
        brightness: 1,
        saturation: 0,
    });

    const [buttonBorderRadius, setButtonBorderRadius] = useState(20);

    const handleChangeButtonBorderRadius = useCallback(
        (value: number) => setButtonBorderRadius(value),
        [],
    );

    const [appliedDiscountCodeFS, setAppliedDiscountCodeFS] = useState(20);

    const handleChangeAppliedDiscountCodeFS = useCallback(
        (value: number) => setAppliedDiscountCodeFS(value),
        [],
    );


    const handleSelectChange = useCallback(
        (value: string) => setSelected(value),
        [],
    );

    const options = [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
        { label: 'Justify', value: 'justify' },
    ];

    const [rangeValue, setRangeValue] = useState(20);

    const handleRangeSliderChange = useCallback(
        (value: number) => setRangeValue(value),
        [],
    );




    const [popoverActive, setPopoverActive] = useState(false);
    const [popoverTextActive, setPopoverTextActive] = useState(false);

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const togglePopoverTextActive = useCallback(
        () => setPopoverTextActive((popoverTextActive) => !popoverTextActive),
        [],
    );

    const activator = (
        <div className="preview-color" style={{ backgroundColor: hsbToHex(btnColor.hue, btnColor.saturation, btnColor.brightness), }} onClick={togglePopoverActive}> </div>
    );

    const activator2 = (
        <div className="preview-color" style={{ backgroundColor: hsbToHex(btnTextColor.hue, btnTextColor.saturation, btnTextColor.brightness), }} onClick={togglePopoverTextActive}> </div>
    );


    function hsbToHex(hue: number, saturation: number, brightness: number): string {
        const rgb = hsbToRgb(hue, saturation, brightness);
        return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
    }

    function componentToHex(c: number): string {
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }

    function hsbToRgb(hue: number, saturation: number, brightness: number): { r: number; g: number; b: number } {
        hue = hue / 360;
        let r: number, g: number, b: number;

        if (saturation === 0) {
            r = g = b = brightness;
        } else {
            const i = Math.floor(hue * 6);
            const f = hue * 6 - i;
            const p = brightness * (1 - saturation);
            const q = brightness * (1 - f * saturation);
            const t = brightness * (1 - (1 - f) * saturation);

            switch (i % 6) {
                case 0: r = brightness; g = t; b = p; break;
                case 1: r = q; g = brightness; b = p; break;
                case 2: r = p; g = brightness; b = t; break;
                case 3: r = p; g = q; b = brightness; break;
                case 4: r = t; g = p; b = brightness; break;
                case 5: r = brightness; g = p; b = q; break;
                default: throw new Error("Invalid hue value");
            }
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }
    return (
        <Page
            title="Customize Cart Summary"
            primaryAction={<Button variant="primary" tone="success">Save</Button>}
            secondaryActions={<Button>Restore Defaults</Button>}
        >
            <Layout>
                <Layout.Section>
                    <InlineGrid columns={{ xs: "1fr", md: "2fr 1fr" }} gap="400" alignItems="start">
                        <BlockStack gap="300">
                            <Card>
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Discount Field And Button
                                    </Text>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Placeholder
                                        </Text>
                                        <TextField autoComplete="off" label="" value="Discount Code"/>
                                    </InlineGrid>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Input Border Radius
                                        </Text>
                                        <RangeSlider
                                            output
                                            label=""
                                            min={0}
                                            max={20}
                                            value={fieldBorderRadius}
                                            onChange={handleChangeRangeBorderRadius}
                                            prefix={<p>0px</p>}
                                            suffix={<p>20px</p>}
                                        />
                                    </InlineGrid>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Button Text
                                        </Text>
                                        <TextField autoComplete="off" label="" value="Apply"/>
                                    </InlineGrid>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Font Size
                                        </Text>
                                        <RangeSlider
                                            output
                                            label=""
                                            min={10}
                                            max={20}
                                            value={buttonTextFs}
                                            onChange={handleChangeButtonTextFs}
                                            prefix={<p>10px</p>}
                                            suffix={<p>20px</p>}
                                        />
                                    </InlineGrid>
                                    <InlineStack wrap={true} align="space-between">
                                        <Text as="p" variant="bodyMd">
                                            Button Color
                                        </Text>
                                        <Popover
                                            active={popoverActive}
                                            activator={activator}
                                            onClose={togglePopoverActive}
                                            ariaHaspopup={false}
                                            sectioned
                                        >
                                            <ColorPicker onChange={setBtnColor} color={btnColor} />
                                        </Popover>
                                    </InlineStack>
                                    <InlineStack wrap={true} align="space-between">
                                        <Text as="p" variant="bodyMd">
                                            Button Text Color
                                        </Text>
                                        <Popover
                                            active={popoverTextActive}
                                            activator={activator2}
                                            onClose={togglePopoverTextActive}
                                            ariaHaspopup={false}
                                            sectioned
                                        >
                                            <ColorPicker onChange={setBtnTextColor} color={btnTextColor} />
                                        </Popover>
                                    </InlineStack>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Button Border Radius
                                        </Text>
                                        <RangeSlider
                                            output
                                            label=""
                                            min={0}
                                            max={20}
                                            value={buttonBorderRadius}
                                            onChange={handleChangeButtonBorderRadius}
                                            prefix={<p>0px</p>}
                                            suffix={<p>20px</p>}
                                        />
                                    </InlineGrid>
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Applied Discount Code
                                    </Text>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Font Size
                                        </Text>
                                        <RangeSlider
                                            output
                                            label=""
                                            min={10}
                                            max={20}
                                            value={appliedDiscountCodeFS}
                                            onChange={handleChangeAppliedDiscountCodeFS}
                                            prefix={<p>10px</p>}
                                            suffix={<p>20px</p>}
                                        />
                                    </InlineGrid>
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Discount Information
                                    </Text>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Font Size
                                        </Text>
                                        <RangeSlider
                                            output
                                            label=""
                                            min={10}
                                            max={20}
                                            value={rangeValue}
                                            onChange={handleRangeSliderChange}
                                            prefix={<p>10px</p>}
                                            suffix={<p>20px</p>}
                                        />
                                    </InlineGrid>
                                    <InlineStack wrap={true} align="space-between">
                                        <Text as="p" variant="bodyMd">
                                            Text Color
                                        </Text>
                                        <Popover
                                            active={popoverActive}
                                            activator={activator}
                                            onClose={togglePopoverActive}
                                            ariaHaspopup={false}
                                            sectioned
                                        >
                                            <ColorPicker onChange={setBtnColor} color={btnColor} />
                                        </Popover>
                                    </InlineStack>
                                    <Select
                                        label="Text Alignment"
                                        options={options}
                                        onChange={handleSelectChange}
                                        value={selected}
                                    />
                                </BlockStack>
                            </Card>
                            {/* <Card>
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Custom note
                                    </Text>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Note Text
                                        </Text>
                                        <TextField autoComplete="off" label="" />
                                    </InlineGrid>
                                    <InlineGrid columns={"1fr 2fr"}>
                                        <Text as="p" variant="bodyMd">
                                            Font Size
                                        </Text>
                                        <RangeSlider
                                            output
                                            label=""
                                            min={0}
                                            max={20}
                                            value={rangeValue}
                                            onChange={handleRangeSliderChange}
                                            prefix={<p>0px</p>}
                                            suffix={<p>20px</p>}
                                        />
                                    </InlineGrid>
                                    <InlineStack wrap={true} align="space-between">
                                        <Text as="p" variant="bodyMd">
                                            Text Color
                                        </Text>
                                        <Popover
                                            active={popoverActive}
                                            activator={activator}
                                            onClose={togglePopoverActive}
                                            ariaHaspopup={false}
                                            sectioned
                                        >
                                            <ColorPicker onChange={setBtnColor} color={btnColor} />
                                        </Popover>
                                    </InlineStack>
                                    <Select
                                        label="Text Style"
                                        options={options}
                                        onChange={handleSelectChange}
                                        value={selected}
                                    />
                                    <Select
                                        label="Text Alignment"
                                        options={options}
                                        onChange={handleSelectChange}
                                        value={selected}
                                    />
                                </BlockStack>
                            </Card> */}
                        </BlockStack>
                        <Card>
                            <div className="dmp_discount-block-preview">
                                <div className="dmp_discount-form">
                                    <input type="text" name="temp-discount" className="" placeholder="Discount Code"></input>
                                    <button>Apply</button>
                                </div>

                                <div className="dmp_discount-tag">
                                    <div className="dmp_discount-code">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" style={{ width: '16px', height: '16px' }}>
                                            <path d="M17.78 3.09C17.45 2.443 16.778 2 16 2h-5.165c-.535 0-1.046.214-1.422.593l-6.82 6.89c0 .002 0 .003-.002.003-.245.253-.413.554-.5.874L.738 8.055c-.56-.953-.24-2.178.712-2.737L9.823.425C10.284.155 10.834.08 11.35.22l4.99 1.337c.755.203 1.293.814 1.44 1.533z" fillOpacity=".55"></path>
                                            <path d="M10.835 2H16c1.105 0 2 .895 2 2v5.172c0 .53-.21 1.04-.586 1.414l-6.818 6.818c-.777.778-2.036.782-2.82.01l-5.166-5.1c-.786-.775-.794-2.04-.02-2.828.002 0 .003 0 .003-.002l6.82-6.89C9.79 2.214 10.3 2 10.835 2zM13.5 8c.828 0 1.5-.672 1.5-1.5S14.328 5 13.5 5 12 5.672 12 6.5 12.672 8 13.5 8z"></path>
                                        </svg>
                                        <span className="dmp_code-title">Code</span>
                                        <button type="button" className="dmp_code-remove-button">
                                            <svg width="13" height="13" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1.5 1.5L11.5 11.5" stroke="currentColor" stroke-linecap="round" />
                                                <path d="M11.5 1.5L1.5 11.5" stroke="currentColor" stroke-linecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div><div className="dmp_discount-information">
                                    <div className="dmp_discount-savings">
                                        <span className="dmp_discount-title">Discount:</span>
                                        <span className="dmp_discount-content">-50$</span>
                                    </div>
                                    <div className="dmp_total-information">
                                        <span className="dmp_total-title">Total:</span>
                                        <span className="dmp_total-content">100$</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </InlineGrid>
                </Layout.Section>
            </Layout>
        </Page>
    );
}

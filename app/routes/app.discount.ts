import { ActionFunction, json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
    console.log("=========================hit proxy=========================");
    const { admin, session } = await authenticate.public.appProxy(request);
    const data = await request.json();
    const couponCode = data.discount_code;
    const currency = data.currency;
    const orderItem = data.cart.items;

    try {
        if (session) {
            const discountCodeData = await admin!.rest.resources.DiscountCode.lookup({
                session: session,
                code: couponCode,
            });
            const priceRuleData = await admin!.rest.resources.PriceRule.find({
                session: session,
                id: discountCodeData.discount_code.price_rule_id
            });
            const code = discountCodeData.discount_code.code;
            const targetType = priceRuleData.target_type;
            var dataReturn = {};
            console.log(priceRuleData);

            if (targetType === "line_item") {
                const value_type = priceRuleData.value_type,
                    value = priceRuleData.value,
                    customer_selection = priceRuleData.customer_selection,
                    target_selection = priceRuleData.target_selection,
                    allocation_method = priceRuleData.allocation_method,
                    allocation_limit = priceRuleData.allocation_limit,
                    starts_at = priceRuleData.starts_at,
                    ends_at = priceRuleData.ends_at,
                    entitled_product_ids = priceRuleData.entitled_product_ids,
                    entitled_variant_ids = priceRuleData.entitled_variant_ids,
                    entitled_collection_ids = priceRuleData.entitled_collection_ids,
                    entitled_country_ids = priceRuleData.entitled_country_ids,
                    prerequisite_product_ids = priceRuleData.prerequisite_product_ids,
                    prerequisite_variant_ids = priceRuleData.prerequisite_variant_ids,
                    prerequisite_collection_ids = priceRuleData.prerequisite_collection_ids,
                    prerequisite_subtotal_range = priceRuleData.prerequisite_subtotal_range,
                    prerequisite_quantity_range = priceRuleData.prerequisite_quantity_range,
                    prerequisite_to_entitlement_quantity_ratio = priceRuleData.prerequisite_to_entitlement_quantity_ratio,
                    prerequisite_to_entitlement_purchase = priceRuleData.prerequisite_to_entitlement_purchase.prerequisite_amount;
                const timeNow = new Date();
                const startAtDate = new Date(starts_at);
                const endAtDate = new Date(ends_at);

                var orderPrice = 0;
                var discountPrice = 0;
                var discountVariantPrice = 0;
                var quantity = 0;
                const positiveIntegerValue = Math.abs(parseInt(value, 10));
                
                if ((ends_at && timeNow < endAtDate) || (!ends_at)) {
                    if ((timeNow > startAtDate)) {
                        switch (target_selection) {
                            case 'entitled':
                                const discountItem: any[] = [];
                                const discountVariantItem: any[] = [];
                                orderItem.forEach((item: { final_line_price: number }) => {
                                    orderPrice += item.final_line_price;
                                });
                                if (prerequisite_product_ids.length > 0 || prerequisite_variant_ids.length > 0 || prerequisite_collection_ids.length > 0) {
                                    // Case Buy X Get Y discount
                                    const discountPrerequisiteItem: any[] = [];
                                    let discountPrerequisiteItemQuantity: number = 0;
                                    let discountPrerequisiteItemInCollectionPrice: number = 0;
                                    let flagCheckPrerequisiteToEntitlement: boolean = false;
                                    let totalValue = 0;
                                    let discountPrerequisiteItemInCollectionQuantity = 0;

                                    if (prerequisite_collection_ids.length == 0) {
                                        prerequisite_product_ids.forEach((id: number) => {
                                            discountPrerequisiteItem.push(...orderItem.filter((item: { id: number }) => item.id === id));
                                        });
                                        prerequisite_variant_ids.forEach((id: number) => {
                                            discountPrerequisiteItem.push(...orderItem.filter((item: { variant_id: number }) => item.variant_id === id));
                                        });
                                        discountPrerequisiteItem.forEach((item: { quantity: number, final_line_price: number }) => {
                                            discountPrerequisiteItemInCollectionQuantity += item.quantity;
                                            discountPrerequisiteItemInCollectionPrice += item.final_line_price;
                                        });
                                    } else {
                                        const discountPrerequisiteItemInCollection: any[] = [];
                                        let listProductsInCollection: number[] = [];
                                        for (const id of prerequisite_collection_ids) {
                                            const collection = await admin.rest.resources.Collection.products({
                                                session: session,
                                                id: id,
                                            });
                                            collection.products.forEach((item: { id: number }) => {
                                                listProductsInCollection.push(item.id);
                                            });
                                        }
                                        listProductsInCollection.forEach(e => {
                                            discountPrerequisiteItemInCollection.push(...orderItem.filter((item: { id: number }) => item.id === e));
                                        });
                                        discountPrerequisiteItemInCollection.forEach((item: { quantity: number, final_line_price: number }) => {
                                            discountPrerequisiteItemInCollectionQuantity += item.quantity;
                                            discountPrerequisiteItemInCollectionPrice += item.final_line_price;
                                        });
                                    }
                                    
                                    if (entitled_collection_ids.length > 0) {
                                        let listProductsInCollection: number[] = [];
                                        for (const id of entitled_collection_ids) {
                                            const collection = await admin.rest.resources.Collection.products({
                                                session: session,
                                                id: id,
                                            });
                                            collection.products.forEach((item: { id: number }) => {
                                                listProductsInCollection.push(item.id);
                                            });
                                        }
                                        listProductsInCollection.forEach(e => {
                                            discountItem.push(...orderItem.filter((item: { id: number }) => item.id === e));
                                        });
                                    } else {
                                        entitled_product_ids.forEach((id: number) => {
                                            discountItem.push(...orderItem.filter((item: { id: number }) => item.id === id));
                                        });
                                    }
                                    let x = 0;
                                    let y = 0;
                                    discountItem.forEach((item: { quantity: number, final_line_price: number }) => {
                                        x += item.quantity;
                                        y += item.final_line_price;
                                    });
                                    
                                    if (prerequisite_to_entitlement_purchase != null) {
                                        if (prerequisite_to_entitlement_purchase <= discountPrerequisiteItemInCollectionPrice) {
                                            flagCheckPrerequisiteToEntitlement = true;
                                        }
                                        const buyXMax = Math.floor(discountPrerequisiteItemInCollectionPrice/prerequisite_to_entitlement_purchase);

                                        if (x <= prerequisite_to_entitlement_quantity_ratio.entitled_quantity ) {
                                            flagCheckPrerequisiteToEntitlement = false;
                                        } else if (x % prerequisite_to_entitlement_quantity_ratio.entitled_quantity === 0) {
                                            discountPrerequisiteItemQuantity = x;
                                        } else {
                                            discountPrerequisiteItemQuantity = Math.floor(x / prerequisite_to_entitlement_quantity_ratio.entitled_quantity) * prerequisite_to_entitlement_quantity_ratio.entitled_quantity;
                                        }
                                        if (buyXMax * prerequisite_to_entitlement_quantity_ratio.entitled_quantity < discountPrerequisiteItemQuantity) {
                                            discountPrerequisiteItemQuantity = buyXMax * prerequisite_to_entitlement_quantity_ratio.entitled_quantity
                                        }
                                        if (allocation_limit && allocation_limit <  Math.floor(discountPrerequisiteItemInCollectionPrice / prerequisite_to_entitlement_purchase)) {
                                            discountPrerequisiteItemQuantity = allocation_limit*prerequisite_to_entitlement_quantity_ratio.entitled_quantity;
                                        }
                                    }
                                    if (prerequisite_to_entitlement_quantity_ratio != null && prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity != null) {
                                        if (prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity <= discountPrerequisiteItemInCollectionQuantity && x > prerequisite_to_entitlement_quantity_ratio.entitled_quantity) {
                                            flagCheckPrerequisiteToEntitlement = true;
                                        }
                                        const buyXMax = Math.floor(discountPrerequisiteItemInCollectionQuantity/prerequisite_to_entitlement_quantity_ratio.prerequisite_quantity);
                                        
                                        if (x <= prerequisite_to_entitlement_quantity_ratio.entitled_quantity) {
                                            flagCheckPrerequisiteToEntitlement = false;
                                        } else if (x % prerequisite_to_entitlement_quantity_ratio.entitled_quantity === 0) {
                                            discountPrerequisiteItemQuantity = x;
                                        } else {
                                            discountPrerequisiteItemQuantity = Math.floor(x / prerequisite_to_entitlement_quantity_ratio.entitled_quantity) * prerequisite_to_entitlement_quantity_ratio.entitled_quantity;
                                        }
                                        if (buyXMax * prerequisite_to_entitlement_quantity_ratio.entitled_quantity < discountPrerequisiteItemQuantity) {
                                            discountPrerequisiteItemQuantity = buyXMax * prerequisite_to_entitlement_quantity_ratio.entitled_quantity
                                        }
                                        if (allocation_limit && allocation_limit <  Math.floor(discountPrerequisiteItemQuantity / prerequisite_to_entitlement_quantity_ratio.entitled_quantity)) {
                                            discountPrerequisiteItemQuantity = allocation_limit*prerequisite_to_entitlement_quantity_ratio.entitled_quantity;
                                        }
                                    }

                                    if (entitled_variant_ids.length > 0) {
                                        entitled_variant_ids.forEach((id: number) => {
                                            discountItem.push(...orderItem.filter((item: { variant_id: number }) => item.variant_id === id));
                                        });
                                    }
                                    const sortedProducts = discountItem.sort((a, b) => a.original_price - b.original_price);
                                    
                                    let count = 0;
                                    for (const product of sortedProducts) {
                                        if (count + product.quantity <= discountPrerequisiteItemQuantity) {
                                            totalValue += product.original_price * product.quantity;
                                            count += product.quantity;
                                        } else {
                                            let remaining = discountPrerequisiteItemQuantity - count;
                                            totalValue += product.original_price * remaining;
                                            break;
                                        }

                                        if (count >= discountPrerequisiteItemQuantity) break;
                                    }
                                    
                                    if (flagCheckPrerequisiteToEntitlement !== false) {
                                        if (value_type === "percentage") {
                                            const discountAmount = Math.round(totalValue * (positiveIntegerValue / 100));
                                            const priceOrderAfterDiscount = orderPrice - discountAmount;
                                            dataReturn = {
                                                "discount_detail": {
                                                    "title": code,
                                                    "type": targetType,
                                                    "discount_amount": discountAmount,
                                                    "total": priceOrderAfterDiscount,
                                                    "currency": currency,
                                                },
                                                "statusCode": 200
                                            }
                                            return json({ data: dataReturn });
                                        } else {
                                            let discountAmount = 0;
                                            let priceOrderAfterDiscount = 0;
                                            if (allocation_method === "across") {
                                                discountAmount = positiveIntegerValue
                                            } else {
                                                discountAmount = positiveIntegerValue * discountPrerequisiteItemQuantity
                                            }
                                            priceOrderAfterDiscount = orderPrice - discountAmount
    
                                            dataReturn = {
                                                "discount_detail": {
                                                    "title": code,
                                                    "type": targetType,
                                                    "discount_amount": discountAmount,
                                                    "total": priceOrderAfterDiscount,
                                                    "currency": currency,
                                                },
                                                "statusCode": 200
                                            }
                                            return json({ data: dataReturn });
                                        }
                                    }
                                } else {
                                    if (entitled_collection_ids.length > 0) {
                                        let listProductsInCollection: number[] = [];
                                        for (const id of entitled_collection_ids) {
                                            const collection = await admin.rest.resources.Collection.products({
                                                session: session,
                                                id: id,
                                            });
                                            collection.products.forEach((item: { id: number }) => {
                                                listProductsInCollection.push(item.id);
                                            });
                                        }
                                        listProductsInCollection.forEach(e => {
                                            discountItem.push(...orderItem.filter((item: { id: number }) => item.id === e));
                                        });
                                        discountItem.forEach((item: { final_line_price: number, quantity: number }) => {
                                            discountPrice += item.final_line_price;
                                            quantity += item.quantity;
                                        });
                                    } else {
                                        entitled_product_ids.forEach((id: number) => {
                                            discountItem.push(...orderItem.filter((item: { id: number }) => item.id === id));
                                        });
                                        discountItem.forEach((item: { final_line_price: number, quantity: number }) => {
                                            discountPrice += item.final_line_price;
                                            quantity += item.quantity;
                                        });
                                        if (entitled_variant_ids) {
                                            entitled_variant_ids.forEach((id: number) => {
                                                discountVariantItem.push(...orderItem.filter((item: { variant_id: number }) => item.variant_id === id));
                                            });
                                            discountVariantItem.forEach((item: { final_line_price: number, quantity: number }) => {
                                                discountVariantPrice += item.final_line_price;
                                                quantity += item.quantity;
                                            });
                                        }
                                    }
                                    if (
                                        (!prerequisite_subtotal_range && !prerequisite_quantity_range) ||
                                        (prerequisite_quantity_range && quantity >= prerequisite_quantity_range.greater_than_or_equal_to) ||
                                        (prerequisite_subtotal_range && (discountPrice + discountVariantPrice) >= prerequisite_subtotal_range.greater_than_or_equal_to)
                                    ) {
                                        if (value_type === "percentage") {
                                            const discountAmount = Math.round((discountPrice + discountVariantPrice) * (positiveIntegerValue / 100));
                                            const priceOrderAfterDiscount = orderPrice - discountAmount;
                                            dataReturn = {
                                                "discount_detail": {
                                                    "title": code,
                                                    "type": targetType,
                                                    "discount_amount": discountAmount,
                                                    "total": priceOrderAfterDiscount,
                                                    "currency": currency,
                                                },
                                                "statusCode": 200
                                            }
                                            return json({ data: dataReturn });
                                        } else {
                                            let discountAmount = 0;
                                            let priceOrderAfterDiscount = 0;
                                            if (allocation_method === "across") {
                                                discountAmount = positiveIntegerValue
                                            } else {
                                                discountAmount = positiveIntegerValue * quantity
                                            }
                                            
                                            priceOrderAfterDiscount = orderPrice - discountAmount

                                            dataReturn = {
                                                "discount_detail": {
                                                    "title": code,
                                                    "type": targetType,
                                                    "discount_amount": discountAmount,
                                                    "total": priceOrderAfterDiscount,
                                                    "currency": currency,
                                                },
                                                "statusCode": 200
                                            }
                                            return json({ data: dataReturn });
                                        }
                                    }
                                }
                                break;
                            default:
                                // type ammount off order
                                orderItem.forEach((item: { final_line_price: number; quantity: number; }) => {
                                    orderPrice += item.final_line_price;
                                    quantity += item.quantity;
                                });
                                if (
                                    (prerequisite_subtotal_range && orderPrice >= prerequisite_subtotal_range.greater_than_or_equal_to) ||
                                    (!prerequisite_subtotal_range && !prerequisite_quantity_range) ||
                                    (prerequisite_quantity_range && quantity >= prerequisite_quantity_range.greater_than_or_equal_to)
                                ) {
                                    if (value_type === "percentage") {
                                        const discountAmount = Math.round(orderPrice * (positiveIntegerValue / 100));
                                        const priceOrderAfterDiscount = orderPrice - discountAmount;
                                        dataReturn = {
                                            "discount_detail": {
                                                "title": code,
                                                "type": targetType,
                                                "discount_amount": discountAmount,
                                                "total": priceOrderAfterDiscount,
                                                "currency": currency,
                                            },
                                            "statusCode": 200
                                        }
                                        return json({ data: dataReturn });
                                    } else {
                                        const discountAmount = positiveIntegerValue;
                                        const priceOrderAfterDiscount = orderPrice - discountAmount;
                                        dataReturn = {
                                            "discount_detail": {
                                                "title": code,
                                                "type": targetType,
                                                "discount_amount": discountAmount,
                                                "total": priceOrderAfterDiscount,
                                                "currency": currency,
                                            },
                                            "statusCode": 200
                                        }
                                        return json({ data: dataReturn });
                                    }
                                }
                                break;
                        }
                    }
                }
            } else if (targetType === "shipping_line") {
                dataReturn = {
                    "discount_detail": {
                        "title": code,
                        "type": targetType
                    },
                    "statusCode": 200
                }
                return json({ data: dataReturn });
                // return freeship because shipping fee is calculated at checkout page
            }
            return json({
                data: {
                    "message": `Coupon code '${couponCode.toUpperCase()}' is not valid.`,
                    "statusCode": 404
                }
            });
        }

    } catch {
        let error = {
            "message": `Coupon code '${couponCode.toUpperCase()}' is not found.`,
            "statusCode": 404
        }
        return json({ data: error });
    }
}
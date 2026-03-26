import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    const { topic, shop, payload } = await authenticate.webhook(request);

    console.log("Webhook received:", topic);

    switch (topic) {
        case "CUSTOMERS_DATA_REQUEST":
            console.log("GDPR data request", payload);
            break;

        case "CUSTOMERS_REDACT":
            console.log("GDPR customer redact", payload);
            break;

        case "SHOP_REDACT":
            console.log("GDPR shop redact", payload);
            break;

        default:
            console.log("Unhandled webhook:", topic);
    }

    return json({ success: true });
};
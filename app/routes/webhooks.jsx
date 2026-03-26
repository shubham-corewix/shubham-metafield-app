import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    const { topic, shop, session } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    switch (topic) {
        case "CUSTOMERS_DATA_REQUEST":
            // Handle customer data request
            // You must return customer data if you store any
            return new Response(null, { status: 200 });

        case "CUSTOMERS_REDACT":
            // Delete customer data from your database if stored
            return new Response(null, { status: 200 });

        case "SHOP_REDACT":
            // Delete all shop data from your database
            return new Response(null, { status: 200 });

        default:
            return new Response("Unhandled webhook topic", { status: 404 });
    }
};
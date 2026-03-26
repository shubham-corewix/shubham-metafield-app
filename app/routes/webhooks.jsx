import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    try {
        const { topic } = await authenticate.webhook(request);

        console.log("Webhook received:", topic);

        return json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Error", { status: 500 });
    }
};
import { json } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);

    await registerWebhooks({ session });

    return json({ success: true });
};
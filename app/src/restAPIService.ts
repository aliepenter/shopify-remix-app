import { authenticate } from "~/shopify.server";
import { LoaderFunctionArgs } from "@remix-run/node";


export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const themes = await admin.rest.resources.Theme.all({
        session: session,
    });
    return { themes };
};
import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(`
    {
      metafieldDefinitions(ownerType: PRODUCT, first: 20) {
        edges {
          node {
            id
            name
            namespace
            key
            type { name }
          }
        }
      }
    }
  `);

    const data = await response.json();
    const definitions = data.data.metafieldDefinitions.edges.map(e => e.node);
    return { definitions };
};

export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();

    const name = formData.get("name");
    const namespace = formData.get("namespace");
    const key = formData.get("key");
    const type = formData.get("type");

    const response = await admin.graphql(`
    mutation CreateMetafieldDefinition($def: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $def) {
        createdDefinition { id name }
        userErrors { field message }
      }
    }
  `, {
        variables: {
            def: { name, namespace, key, type, ownerType: "PRODUCT" }
        }
    });

    const result = await response.json();
    const errors = result.data.metafieldDefinitionCreate.userErrors;
    return { success: errors.length === 0, errors };
};

export default function MetafieldsPage() {
    const { definitions } = useLoaderData();
    const fetcher = useFetcher();

    const [name, setName] = useState("");
    const [namespace] = useState("custom_filtter");
    const [key, setKey] = useState("");
    const [type, setType] = useState("single_line_text_field");
    const isLoading = ["loading", "submitting"].includes(fetcher.state);

    const handleSubmit = () => {
        fetcher.submit(
            { name, namespace, key, type },
            { method: "POST" }
        );
        setName("");
        setKey("");
    };

    return (
        <s-page heading="Metafield Manager">

            <s-section heading="Create New Metafield">
                <s-stack direction="block" gap="base">

                    <s-text-field
                        label="Name"
                        value={name}
                        onInput={(e) => {
                            const val = e.target.value;
                            setName(val);
                            setKey(val.toLowerCase().replace(/\s+/g, "_"));
                        }}
                        placeholder="e.g. Fabric"
                    />

                    <s-text-field
                        readOnly
                        label="Namespace"
                        value={namespace}
                        onInput={(e) => setNamespace(e.target.value)}
                        placeholder="e.g. custom"

                    />

                    <s-text-field
                        readOnly
                        label="Key"
                        value={key}
                        onInput={(e) => setKey(e.target.value)}
                        placeholder="e.g. fabric"
                    />

                    <s-select
                        label="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <s-option value="single_line_text_field">Single line text</s-option>
                        <s-option value="multi_line_text_field">Multi line text</s-option>
                        <s-option value="number_integer">Number (integer)</s-option>
                        <s-option value="number_decimal">Number (decimal)</s-option>
                        <s-option value="date">Date</s-option>
                        <s-option value="boolean">True / False</s-option>
                        <s-option value="url">URL</s-option>
                    </s-select>

                    <s-button
                        onClick={handleSubmit}
                        {...(isLoading ? { loading: true } : {})}
                    >
                        Create Metafield
                    </s-button>

                    {fetcher.data?.success && (
                        <s-banner tone="success">
                            Metafield created successfully!
                        </s-banner>
                    )}
                    {fetcher.data?.errors?.length > 0 && (
                        <s-banner tone="critical">
                            Error: {fetcher.data.errors[0].message}
                        </s-banner>
                    )}

                </s-stack>
            </s-section>

            {/* List existing metafields */}
            <s-section heading="Existing Metafields">
                {definitions.length === 0 ? (
                    <s-paragraph>No metafields yet. Create one above!</s-paragraph>
                ) : (
                    <s-stack direction="block" gap="base">
                        {definitions.map((def) => (
                            <s-box
                                key={def.id}
                                padding="base"
                                borderWidth="base"
                                borderRadius="base"
                                background="subdued"
                            >
                                <s-stack direction="inline" gap="base">
                                    <s-text><strong>{def.name}</strong></s-text>
                                    <s-text>{def.namespace}.{def.key}</s-text>
                                    <s-text>{def.type.name}</s-text>
                                </s-stack>
                            </s-box>
                        ))}
                    </s-stack>
                )}
            </s-section>

        </s-page>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};

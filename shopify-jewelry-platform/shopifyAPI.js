const API_PROXY_ENDPOINT = '/api/shopify';

async function sendShopifyQuery(query, variables = {}) {
  const response = await fetch(API_PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('❌ Shopify returned HTTP 401');
    throw new Error(`❌ Shopify HTTP error ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    const message = payload.errors[0].message || 'Unknown Shopify error';
    if (message.toLowerCase().includes('token')) throw new Error('❌ Invalid API token');
    throw new Error(`❌ ${message}`);
  }
  return payload.data;
}

export async function createShopifyProduct(product) {
  const mutation = `
    mutation createProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product { id title }
        userErrors { message }
      }
    }
  `;

  const input = {
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    metafields: product.metafields
  };

  const data = await sendShopifyQuery(mutation, { input });
  const errors = data.productCreate.userErrors;
  if (errors?.length) throw new Error(`❌ Product creation failed: ${errors[0].message}`);

  return data.productCreate.product;
}

export async function bulkCreateVariants(productId, variants) {
  const mutation = `
    mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        productVariants { id title }
        userErrors { message }
      }
    }
  `;

  const formatted = variants.map((v) => ({
    price: String(v.price),
    compareAtPrice: String(v.compareAtPrice),
    inventoryItem: { sku: v.sku, tracked: true },
    inventoryQuantities: [{ availableQuantity: v.inventoryQty, locationId: null }],
    optionValues: [{ name: v.option1, optionName: 'Color' }, { name: v.option2, optionName: 'Size' }]
  }));

  const data = await sendShopifyQuery(mutation, { productId, variants: formatted });
  const errors = data.productVariantsBulkCreate.userErrors;
  if (errors?.length) throw new Error(`❌ Variant generation error: ${errors[0].message}`);
  return data.productVariantsBulkCreate.productVariants;
}

export async function attachMetafields(ownerId, metafields) {
  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id key namespace }
        userErrors { message }
      }
    }
  `;

  const data = await sendShopifyQuery(mutation, {
    metafields: metafields.map((m) => ({ ...m, ownerId }))
  });

  const errors = data.metafieldsSet.userErrors;
  if (errors?.length) throw new Error(`❌ Metafield attach failed: ${errors[0].message}`);
  return data.metafieldsSet.metafields;
}

export async function uploadProductMedia(productId, mediaEntries) {
  const mutation = `
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { ... on MediaImage { image { url } } ... on Video { sources { url } } }
        mediaUserErrors { message }
      }
    }
  `;

  const data = await sendShopifyQuery(mutation, {
    productId,
    media: mediaEntries.map((item) => ({
      originalSource: item.src,
      mediaContentType: item.type
    }))
  });

  const errors = data.productCreateMedia.mediaUserErrors;
  if (errors?.length) throw new Error(`❌ Media upload failed: ${errors[0].message}`);
  return data.productCreateMedia.media;
}

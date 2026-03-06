const HEADERS = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
  'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description',
  'Google Shopping / Google Product Category', 'Google Shopping / Gender', 'Google Shopping / Age Group',
  'Google Shopping / MPN', 'Google Shopping / Condition', 'Google Shopping / Custom Product',
  'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1', 'Google Shopping / Custom Label 2',
  'Google Shopping / Custom Label 3', 'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit',
  'Variant Tax Code', 'Cost per item', 'Included / United States', 'Price / United States',
  'Compare At Price / United States', 'Status'
];

const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export function generateShopifyCsv(products) {
  const rows = [HEADERS.join(',')];

  products.forEach((product) => {
    const handle = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    product.variants.forEach((variant, index) => {
      const firstRow = index === 0;
      const imageSrc = product.media[index]?.src || product.media[0]?.src || '';
      const row = {
        'Handle': handle,
        'Title': firstRow ? product.title : '',
        'Body (HTML)': firstRow ? product.descriptionHtml : '',
        'Vendor': firstRow ? product.vendor : '',
        'Product Category': firstRow ? product.productCategory : '',
        'Type': firstRow ? product.productType : '',
        'Tags': firstRow ? product.tags.join(', ') : '',
        'Published': 'TRUE',
        'Option1 Name': 'Color',
        'Option1 Value': variant.option1,
        'Option2 Name': 'Size',
        'Option2 Value': variant.option2,
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': variant.sku,
        'Variant Grams': variant.weight,
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': variant.inventoryQty,
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': variant.price,
        'Variant Compare At Price': variant.compareAtPrice,
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': firstRow ? imageSrc : '',
        'Image Position': firstRow ? 1 : '',
        'Image Alt Text': firstRow ? `${product.title} image` : '',
        'Gift Card': 'FALSE',
        'SEO Title': firstRow ? product.seo.title : '',
        'SEO Description': firstRow ? product.seo.description : '',
        'Google Shopping / Google Product Category': firstRow ? product.productCategory : '',
        'Google Shopping / Gender': firstRow ? 'female' : '',
        'Google Shopping / Age Group': firstRow ? 'adult' : '',
        'Google Shopping / MPN': variant.sku,
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'TRUE',
        'Google Shopping / Custom Label 0': 'silver-jewelry',
        'Google Shopping / Custom Label 1': variant.option1,
        'Google Shopping / Custom Label 2': variant.option2,
        'Google Shopping / Custom Label 3': '',
        'Google Shopping / Custom Label 4': '',
        'Variant Image': '',
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': '',
        'Included / United States': 'TRUE',
        'Price / United States': variant.price,
        'Compare At Price / United States': variant.compareAtPrice,
        'Status': 'active'
      };

      rows.push(HEADERS.map((header) => escapeCsv(row[header])).join(','));
    });
  });

  return rows.join('\n');
}

export function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

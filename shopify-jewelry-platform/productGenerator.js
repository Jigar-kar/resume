export const DEFAULT_METAFIELDS = [
  { namespace: 'custom', key: 'jewelry_material', value: '925 Sterling Silver', type: 'single_line_text_field' },
  { namespace: 'custom', key: 'jewelry_type', value: 'Ring', type: 'single_line_text_field' },
  { namespace: 'custom', key: 'target_gender', value: 'Women', type: 'single_line_text_field' },
  { namespace: 'custom', key: 'stone_type', value: 'Cubic Zirconia', type: 'single_line_text_field' },
  { namespace: 'custom', key: 'purity', value: '925', type: 'single_line_text_field' }
];

export function createProductFromForm(formData) {
  return {
    title: formData.get('title')?.trim() || 'Untitled Silver Jewelry',
    descriptionHtml: formData.get('description') || '',
    vendor: formData.get('vendor') || 'Silver Studio',
    productCategory: formData.get('category') || 'Jewelry',
    productType: formData.get('productType') || 'Ring',
    tags: (formData.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
    seo: {
      title: formData.get('seoTitle') || '',
      description: formData.get('seoDescription') || ''
    },
    baseVariant: {
      price: Number(formData.get('price') || 0),
      compareAtPrice: Number(formData.get('compareAtPrice') || 0),
      sku: formData.get('sku') || 'SILVER-SKU',
      inventoryQty: Number(formData.get('inventory') || 0),
      weight: Number(formData.get('weight') || 0)
    },
    metafields: [...DEFAULT_METAFIELDS]
  };
}

export function createBulkProducts(baseTitle, count, selectedColors) {
  const colorCycle = selectedColors.length ? selectedColors : ['Silver', 'Rose Gold', 'Gold'];
  return Array.from({ length: count }, (_, i) => {
    const color = colorCycle[i % colorCycle.length];
    return `${baseTitle} – ${color}${count > colorCycle.length ? ` ${Math.floor(i / colorCycle.length) + 1}` : ''}`;
  });
}

export const COLOR_OPTIONS = [
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Gold', hex: '#D4AF37' }
];

export const SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export function generateVariants(selectedColors, selectedSizes, baseVariant) {
  if (!selectedColors.length || !selectedSizes.length) {
    throw new Error('❌ Variant generation error');
  }

  return selectedColors.flatMap((color) =>
    selectedSizes.map((size) => ({
      option1: color,
      option2: size,
      sku: `${baseVariant.sku}-${color.replace(/\s+/g, '').toUpperCase()}-${size}`,
      price: Number(baseVariant.price).toFixed(2),
      compareAtPrice: Number(baseVariant.compareAtPrice).toFixed(2),
      inventoryQty: Number(baseVariant.inventoryQty),
      weight: Number(baseVariant.weight)
    }))
  );
}

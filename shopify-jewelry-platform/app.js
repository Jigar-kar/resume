import { createProductFromForm, createBulkProducts } from './productGenerator.js';
import { generateVariants } from './variantGenerator.js';
import { generateShopifyCsv, downloadCsv } from './csvGenerator.js';
import { parseMediaFromInputs, normalizeMediaForShopify } from './mediaUploader.js';
import { createShopifyProduct, bulkCreateVariants, uploadProductMedia, attachMetafields } from './shopifyAPI.js';
import { renderColorSwatches, renderSizeButtons, renderMediaList, renderPreview, setStatus, renderHistory } from './uiController.js';

const state = {
  selectedColors: ['Silver', 'Rose Gold', 'Gold'],
  selectedSizes: ['1', '2', '3', '4', '5', '6', '7', '8'],
  media: [],
  history: [],
  bulkTitles: []
};

const refs = {
  productForm: document.getElementById('productForm'),
  colorSwatches: document.getElementById('colorSwatches'),
  sizeButtons: document.getElementById('sizeButtons'),
  variantCount: document.getElementById('variantCount'),
  mediaFiles: document.getElementById('mediaFiles'),
  mediaUrls: document.getElementById('mediaUrls'),
  mediaList: document.getElementById('mediaList'),
  previewCard: document.getElementById('previewCard'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  uploadShopifyBtn: document.getElementById('uploadShopifyBtn'),
  statusBanner: document.getElementById('statusBanner'),
  generateBulkBtn: document.getElementById('generateBulkBtn'),
  bulkTitle: document.getElementById('bulkTitle'),
  bulkQuantity: document.getElementById('bulkQuantity'),
  bulkSummary: document.getElementById('bulkSummary'),
  historyList: document.getElementById('historyList')
};

function toggleItem(arr, value) {
  return arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value];
}

function getCurrentProduct() {
  return createProductFromForm(new FormData(refs.productForm));
}

function getCurrentVariants() {
  return generateVariants(state.selectedColors, state.selectedSizes, getCurrentProduct().baseVariant);
}

function getCurrentProductPayload() {
  return {
    ...getCurrentProduct(),
    variants: getCurrentVariants(),
    media: state.media
  };
}

function refreshUi() {
  renderColorSwatches(refs.colorSwatches, state.selectedColors, (color) => {
    state.selectedColors = toggleItem(state.selectedColors, color);
    refreshUi();
  });

  renderSizeButtons(refs.sizeButtons, state.selectedSizes, (size) => {
    state.selectedSizes = toggleItem(state.selectedSizes, size);
    refreshUi();
  });

  renderMediaList(refs.mediaList, state.media);

  try {
    const product = getCurrentProduct();
    const variants = getCurrentVariants();
    refs.variantCount.textContent = `${variants.length} variants generated`;
    renderPreview(refs.previewCard, product, variants, state.media);
  } catch (error) {
    refs.variantCount.textContent = '0 variants generated';
    setStatus(refs.statusBanner, error.message, 'error');
  }

  renderHistory(refs.historyList, state.history);
}

function bindEvents() {
  refs.productForm.addEventListener('input', refreshUi);

  const syncMedia = () => {
    state.media = parseMediaFromInputs(refs.mediaFiles.files, refs.mediaUrls.value);
    refreshUi();
  };

  refs.mediaFiles.addEventListener('change', syncMedia);
  refs.mediaUrls.addEventListener('input', syncMedia);

  refs.generateBulkBtn.addEventListener('click', () => {
    const quantity = Number(refs.bulkQuantity.value);
    state.bulkTitles = createBulkProducts(refs.bulkTitle.value.trim(), quantity, state.selectedColors);
    refs.bulkSummary.textContent = `${state.bulkTitles.length} products generated. Sample: ${state.bulkTitles.slice(0, 3).join(' | ')}`;
    setStatus(refs.statusBanner, 'Bulk products generated', 'success');
  });

  refs.exportCsvBtn.addEventListener('click', () => {
    try {
      const products = state.bulkTitles.length
        ? state.bulkTitles.map((title) => ({ ...getCurrentProductPayload(), title }))
        : [getCurrentProductPayload()];

      const csv = generateShopifyCsv(products);
      downloadCsv('shopify-jewelry-products.csv', csv);
      setStatus(refs.statusBanner, 'CSV exported successfully', 'success');
    } catch (error) {
      setStatus(refs.statusBanner, error.message, 'error');
    }
  });

  refs.uploadShopifyBtn.addEventListener('click', async () => {
    setStatus(refs.statusBanner, 'Uploading product to Shopify...', 'info');

    try {
      const productPayload = getCurrentProductPayload();
      const product = await createShopifyProduct(productPayload);
      await bulkCreateVariants(product.id, productPayload.variants);

      const mediaInput = normalizeMediaForShopify(state.media);
      if (mediaInput.length) {
        const uploadedMedia = await uploadProductMedia(product.id, mediaInput);
        const cdnUrls = uploadedMedia
          .map((m) => m.image?.url || m.sources?.[0]?.url)
          .filter(Boolean)
          .filter((u) => u.includes('cdn.shopify.com'));

        if (cdnUrls.length) {
          setStatus(refs.statusBanner, `Media uploaded to Shopify CDN (${cdnUrls.length})`, 'success');
        }
      }

      await attachMetafields(product.id, productPayload.metafields);

      state.history.unshift({
        time: Date.now(),
        title: productPayload.title,
        variants: productPayload.variants.length
      });
      refreshUi();

      setStatus(refs.statusBanner, '✅ Product uploaded successfully', 'success');
    } catch (error) {
      setStatus(refs.statusBanner, error.message, 'error');
    }
  });
}

bindEvents();
refreshUi();

import { COLOR_OPTIONS, SIZE_OPTIONS } from './variantGenerator.js';

export function renderColorSwatches(container, selectedColors, onToggle) {
  container.innerHTML = '';
  COLOR_OPTIONS.forEach((color) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `swatch ${selectedColors.includes(color.name) ? 'active' : ''}`;
    button.title = color.name;
    button.style.background = color.hex;
    button.addEventListener('click', () => onToggle(color.name));
    container.appendChild(button);
  });
}

export function renderSizeButtons(container, selectedSizes, onToggle) {
  container.innerHTML = '';
  SIZE_OPTIONS.forEach((size) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `size-btn ${selectedSizes.includes(size) ? 'active' : ''}`;
    button.textContent = size;
    button.addEventListener('click', () => onToggle(size));
    container.appendChild(button);
  });
}

export function renderMediaList(container, media) {
  container.innerHTML = media.length
    ? media.map((m) => `<li>${m.type} • ${m.name} • ${m.src}</li>`).join('')
    : '<li>No media selected.</li>';
}

export function renderPreview(container, product, variants, media) {
  container.innerHTML = `
    <h4>${product.title}</h4>
    <p>${product.descriptionHtml}</p>
    <div class="preview-meta">
      <div><strong>Vendor:</strong> ${product.vendor}</div>
      <div><strong>Type:</strong> ${product.productType}</div>
      <div><strong>Category:</strong> ${product.productCategory}</div>
      <div><strong>Tags:</strong> ${product.tags.join(', ')}</div>
      <div><strong>Variants:</strong> ${variants.length}</div>
      <div><strong>Media:</strong> ${media.length}</div>
      <div><strong>SEO:</strong> ${product.seo.title}</div>
    </div>
  `;
}

export function setStatus(element, message, type = 'info') {
  element.classList.remove('success', 'error');
  if (type === 'success') element.classList.add('success');
  if (type === 'error') element.classList.add('error');
  element.textContent = message;
}

export function renderHistory(container, history) {
  container.innerHTML = history.length
    ? history.map((item) => `<li>${new Date(item.time).toLocaleString()} — ${item.title} (${item.variants} variants)</li>`).join('')
    : '<li>No uploads yet.</li>';
}

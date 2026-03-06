export function parseMediaFromInputs(fileList, urlText) {
  const fromFiles = Array.from(fileList || []).map((file) => {
    const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    return {
      name: file.name,
      type,
      src: URL.createObjectURL(file),
      sourceType: 'local-file'
    };
  });

  const fromUrls = (urlText || '')
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({
      name: url.split('/').pop() || 'remote-media',
      type: url.match(/\.(mp4|mov|webm)$/i) ? 'VIDEO' : 'IMAGE',
      src: url,
      sourceType: 'url'
    }));

  return [...fromFiles, ...fromUrls];
}

export function normalizeMediaForShopify(mediaItems) {
  return mediaItems.map((m) => ({
    src: m.src,
    type: ['IMAGE', 'VIDEO', 'MODEL_3D'].includes(m.type) ? m.type : 'IMAGE'
  }));
}

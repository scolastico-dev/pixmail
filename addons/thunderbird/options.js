document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);

function saveOptions(e) {
  e.preventDefault();
  const apiUrl = document.getElementById('apiUrl').value;
  const pixelLabel = document.getElementById('pixelLabel').value;
  const pixelImg = document.getElementById('pixelImg').value;
  const suffixEmailToLabel = document.getElementById('suffixEmailToLabel').checked;

  browser.storage.local.set({ apiUrl, pixelLabel, pixelImg, suffixEmailToLabel }).then(() => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
  });
}

function restoreOptions() {
  browser.storage.local.get(['apiUrl', 'pixelLabel', 'pixelImg', 'suffixEmailToLabel']).then((result) => {
    if (result.apiUrl) document.getElementById('apiUrl').value = result.apiUrl;
    if (result.pixelLabel) document.getElementById('pixelLabel').value = result.pixelLabel;
    if (result.pixelImg) document.getElementById('pixelImg').value = result.pixelImg;
    if (result.suffixEmailToLabel) document.getElementById('suffixEmailToLabel').checked = result.suffixEmailToLabel;
  });
}

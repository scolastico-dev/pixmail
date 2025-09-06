// Speichert die Optionen in chrome.storage
function save_options() {
    const apiUrl = document.getElementById('apiUrl').value;
    const apiToken = document.getElementById('apiToken').value;
    const defaultImageUrl = document.getElementById('defaultImageUrl').value;

    chrome.storage.sync.set({
        apiUrl: apiUrl,
        apiToken: apiToken,
        defaultImageUrl: defaultImageUrl
    }, function() {
        // Update-Status, damit der Benutzer weiß, dass es gespeichert wurde.
        const status = document.getElementById('status');
        status.textContent = 'Settings saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1500);
    });
}

// Stellt die gespeicherten Werte in den Formularfeldern wieder her.
function restore_options() {
    // **Änderung hier:** Neuer Standardwert für das Pixel
    const defaultPixel = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png';

    chrome.storage.sync.get({
        apiUrl: '',
        apiToken: '',
        defaultImageUrl: defaultPixel
    }, function(items) {
        document.getElementById('apiUrl').value = items.apiUrl;
        document.getElementById('apiToken').value = items.apiToken;
        document.getElementById('defaultImageUrl').value = items.defaultImageUrl;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
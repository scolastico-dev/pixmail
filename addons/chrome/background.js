// Diese Funktion ist eine Kopie der aus popup.js, um API-Anfragen zu behandeln
async function apiRequest(settings, endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${settings.apiToken}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${settings.apiUrl}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error during request to ${endpoint}:`, error);
        return null;
    }
}

// Lauscht auf Nachrichten vom Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createPixelForGmail') {
        // Wir müssen die Einstellungen abrufen, bevor wir die API-Anfrage stellen
        (async () => {
            const settings = await chrome.storage.sync.get(['apiUrl', 'apiToken', 'defaultImageUrl']);
            if (!settings.apiUrl || !settings.apiToken) {
                sendResponse({ success: false, error: "API settings not configured." });
                return;
            }

            const newPixel = await apiRequest(settings, '/pixel', 'POST', {
                label: request.label,
                img: settings.defaultImageUrl
            });

            if (newPixel && newPixel.id) {
                const trackingUrl = `${settings.apiUrl}/get/${newPixel.id}`;
                sendResponse({ success: true, url: trackingUrl });
            } else {
                sendResponse({ success: false, error: "Failed to create pixel via API." });
            }
        })();

        return true; // Wichtig für asynchrone sendResponse-Aufrufe
    }
});
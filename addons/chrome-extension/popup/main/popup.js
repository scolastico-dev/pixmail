document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const createBtn = document.querySelector('.btn-create');
    const settingsBtn = document.querySelector('.btn-settings');
    const activePixelsList = document.getElementById('active-pixels-list');
    const logHistoryList = document.getElementById('log-history-list');

    let settings = {};

    // Function to load data from the API
    const loadData = async () => {
        const data = await chrome.storage.sync.get(['apiUrl', 'apiToken', 'defaultImageUrl']);
        if (!data.apiUrl || !data.apiToken) {
            activePixelsList.innerHTML = `<div class="history">Please set the API URL and Token in the settings first.</div>`;
            logHistoryList.innerHTML = '';
            return;
        }
        settings = data;
        fetchActivePixels();
        fetchLogs();
    };

    // Helper function for API requests
    const apiRequest = async (endpoint, method = 'GET', body = null) => {
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
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error(`Error during request to ${endpoint}:`, error);
            return null;
        }
    };

    // Fetch and display active pixels
    const fetchActivePixels = async () => {
        const pixels = await apiRequest('/pixel');
        activePixelsList.innerHTML = '';
        if (pixels && pixels.length > 0) {
            pixels.forEach(pixel => {
                const pixelDiv = document.createElement('div');
                pixelDiv.className = 'history';
                const trackingUrl = `${settings.apiUrl}/get/${pixel.id}`;
                // HTML for a pixel entry
                pixelDiv.innerHTML = `
                    <span><b>Label:</b> ${pixel.label || 'No label'}</span>
                    <div class="pixel-actions">
                        <button class="btn btn-delete" data-id="${pixel.id}">Delete</button>
                        <button class="btn btn-copy" data-url="${trackingUrl}">Copy URL</button>
                    </div>
                `;
                activePixelsList.appendChild(pixelDiv);
            });
        } else {
            activePixelsList.innerHTML = `<div class="history pseudo-history">No active pixels found.</div>`;
        }
    };

    // Fetch and display logs
    const fetchLogs = async () => {
        const logs = await apiRequest('/log');
        logHistoryList.innerHTML = '';
        if (logs && logs.length > 0) {
            logs.forEach(log => {
                const logDiv = document.createElement('div');
                logDiv.className = 'history';
                const date = new Date(log.timestamp * 1000).toLocaleString('en-US'); // Adjusted for English locale
                logDiv.innerHTML = `
                    <b>${log.label || 'Pixel'} opened:</b>
                    <small><b>Time:</b> ${date}</small>
                    <small><b>IP:</b> ${log.ip}</small>
                    <small><b>User Agent:</b> ${log.user_agent}</small>
                `;
                logHistoryList.appendChild(logDiv);
            });
        } else {
            logHistoryList.innerHTML = `<div class="history pseudo-history">No logs found.</div>`;
        }
    };

    // Create a new pixel manually
    const createManualPixel = async () => {
        const label = prompt("Please enter a label for the new tracking pixel:", "New Pixel");
        if (label) {
            const newPixel = await apiRequest('/pixel', 'POST', {
                label: label,
                img: settings.defaultImageUrl
            });
            if (newPixel) {
                const trackingUrl = `${settings.apiUrl}/get/${newPixel.id}`;
                navigator.clipboard.writeText(trackingUrl).then(() => {
                    alert(`Tracking URL for "${label}" has been created and copied to the clipboard!`);
                    fetchActivePixels();
                });
            } else {
                alert("Could not create pixel. Check the console for errors.");
            }
        }
    };

    // Function to delete a pixel
    const deletePixel = async (pixelId) => {
        if (confirm("Are you sure you want to permanently delete this pixel?")) {
            const result = await apiRequest(`/pixel/${pixelId}`, 'DELETE');
            console.log('Delete request sent.');
            fetchActivePixels(); // Reload the list to remove the deleted pixel
        }
    };

    // Event Listeners
    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    createBtn.addEventListener('click', createManualPixel);

    // Event listener for clicks on the active pixels list
    activePixelsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-copy')) {
            const url = e.target.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                e.target.textContent = 'Copied!';
                setTimeout(() => {
                    e.target.textContent = 'Copy URL';
                }, 1500);
            });
        } else if (e.target.classList.contains('btn-delete')) {
            const pixelId = e.target.dataset.id;
            deletePixel(pixelId);
        }
    });

    loadData();
});
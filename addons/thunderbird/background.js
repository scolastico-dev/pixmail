browser.composeAction.onClicked.addListener(async (tab) => {
  try {
    const result = await browser.storage.local.get([
      "apiUrl",
      "pixelLabel",
      "pixelImg",
      "suffixEmailToLabel"
    ]);

    const apiUrl = result.apiUrl;
    let pixelLabel = result.pixelLabel;
    const pixelImg = result.pixelImg;
    const suffixEmailToLabel = result.suffixEmailToLabel;

    if (!apiUrl || !pixelLabel || !pixelImg) {
      const warning = "Missing configuration. Please set all options in the extension settings.";
      console.error(warning);
      alert(warning);
      return;
    }

    const details = await browser.compose.getComposeDetails(tab.id);

    if (suffixEmailToLabel && details.to && details.to.length > 0) pixelLabel += ` - ${details.to[0]}`;

    const response = await fetch(`${apiUrl}/pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: pixelLabel, img: pixelImg })
    });

    if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

    const pixelData = await response.json();
    const pixelId = pixelData.id;
    const pixelUrl = `${apiUrl}/get/${pixelId}`;
    const html = `<br><img id="pixmail" data-pix-id="${pixelId}" src="${pixelUrl}" alt="" />`;

    await browser.compose.setComposeDetails(tab.id, { body: details.body + html });
    alert("Tracking pixel added to your email.");
  } catch (error) {
    console.error("Failed to add pixel:", error);
    alert("Failed to add tracking pixel. Please check the console for details.");
  }
});

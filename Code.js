/**
 * Entry point for the web app
 * @param {Object} e - Event object
 * @returns {HtmlOutput} Rendered HTML template
 */
function doGet(e) {
  var output = HtmlService.createTemplateFromFile('main')
    .evaluate()
    .setTitle('Globe SCSOT')
    .setFaviconUrl('https://raw.githubusercontent.com/Azurenian/DSCS/refs/heads/main/globe-logo.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return output;
}

/**
 * Utility function to include partial HTML files
 * @param {string} filename - Name of the HTML file to include
 * @returns {string} The HTML content
 */
function include(filename) {
  return HtmlService.createTemplateFromFile(filename)
    .evaluate()
    .getContent();
}

/**
 * Gets the URL of the deployed script
 * @returns {string} The URL of the deployed script
 */
function getScriptURL() {
  return ScriptApp.getService().getUrl();
}

/**
 * Forces a full page refresh by redirecting to the app URL
 * @returns {HtmlOutput} HTML with redirect script
 */
function forceFullRefresh() {
  // Get the script's deployment URL
  const url = getScriptURL();
  // Return HTML that will force a full browser redirect
  return HtmlService.createHtmlOutput(
    `<script>
      window.top.location.href = "${url}";
    </script>`
  );
}




/*
This module manages template loading for the components.
- Loads HTML templates from <template> tags or external files.
- Returns a cloned template so components can safely use it without affecting the original.
- Handles errors if the template is not found.
*/

export const TemplateLoader = (() => {
    const templateCache = new Map();

    /*
        load a template from the current DOM
        @param {string} id - the ID of the <template> element
        @returns {Element|null} - a cloned DOM element or null if not found
    */
    
    function loadFromDOM(id) {
        const template = document.getElementById(id);
        if (!template) {
            console.warn(`TemplateLoader: Template with ID "${id}" not found in DOM.`);
            return null;
        }
        return template.content.firstElementChild.cloneNode(true);
    }

    /*
        load templates from an external file and cache them
        @param {string} url - the URL of the HTML file containing templates
        @returns {Promise<void>} - resolves when templates are loaded and cached
    */
    async function loadExternal(url) {
        if (templateCache.has(url)) {
            // If already loaded, return immediately
            return;
        }
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`TemplateLoader: Failed to load templates from "${url}". Status: ${res.status}`);
            return;
        }
        const html = await res.text();

        // check and see if template div already exists, if not, create it
        let container = document.getElementById("templates");
        if (!container) {
            container = document.createElement("div");
            container.id = "templates";
            document.body.appendChild(container);
        }

        container.innerHTML += html; // Append to body to make templates available
        templateCache.set(url, true); // Mark as loaded
    }

    return { loadFromDOM, loadExternal };
})();
export const PortalManager = (() => {
    const LAYERS = [
        'tooltips_portal',
        'toasts_portal',
        'dropdowns_portal', // dropdowns, selects, pickers
        'dialogs_portal',
        'sidebars_portal'
    ];

    let portalRoot = null;
    const layerRefs = {};

    function ensurePortalRoot() {
        portalRoot = document.getElementById('ui_portal');
        if (!portalRoot) {
            portalRoot = document.createElement('div');
            portalRoot.id = 'ui_portal';
            document.body.appendChild(portalRoot);
        }
    }

    function ensureLayers() {
        LAYERS.forEach(layerName => {
            let layer = portalRoot.querySelector(`.${layerName}`);
            if (!layer) {
                layer = document.createElement('div');
                layer.id = layerName;
                portalRoot.appendChild(layer);
            }
            layerRefs[layerName] = layer;
        });
    }

    function mountToLayer(element, layerName) {
        if (!layerRefs[layerName]) {
            console.warn(`Layer "${layerName}" not found. Creating it...`);
            const layer = document.createElement('div');
            layer.className = layerName;
            portalRoot.appendChild(layer);
            layerRefs[layerName] = layer;
        }
        layerRefs[layerName].appendChild(element);
    }

    function unmountFromLayer(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    // initialize the portal manager immediately
    ensurePortalRoot();
    ensureLayers();

    return { mountToLayer, unmountFromLayer };
})();
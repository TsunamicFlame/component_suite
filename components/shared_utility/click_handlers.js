/*
This module manages all of the click handlers needed for the UI components.
This includes:
    onClickOutside - used for dropdowns, modals, sidebars, etc.
 */

export const ClickHandlers = (() => {

    // function to handle clicks outside an element
    function onClickOutside(elements, handler) {
        //ensure elements are always in an array
        const targets = Array.isArray(elements) ? elements : [elements];

        function listener(event) {
            const clickInside = targets.some(el => el.contains(event.target));
            if (!clickInside) {
                handler(event);
            }
        }

        // listen for both mouse and touch events for mobile support
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        // return clean up function so the component can stop listening
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    };

    // function to dynamically handle clicks outside an element
    function onClickOutsideDynamic(getElementsFn, handler) {
        function listener(event) {
            const elements = getElementsFn();
            const clickedInside = elements.some(element => element && element.contains(event.target));
            if (!clickedInside) handler(event);
        }
        // listen for both mouse and touch events for mobile support
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        // return clean up function so the component can stop listening
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }

    return { onClickOutside, onClickOutsideDynamic };
})();
/*
This module manages the scroll observer functions for the components
This is often used in conjunction with the position utilities to make dropdowns stay
with their parent when the user scrolls. (it's also used for tooltips and other stuff)
This module includes:
    observeScrollPosition
    observeVisibility
*/

export const ScrollObserver = (() => {

    /*
        Watches an element's position in the viewport and runs a callback on scroll/resize.
        @param {Function} positionFn - called on scroll/resize
        @param {Function} cleanup - call to stop observing
    */
    function observeScrollPosition(positionFn) {
        window.addEventListener('scroll', positionFn, true);
        window.addEventListener('resize', positionFn);

        return () => {
            window.removeEventListener('scroll', positionFn, true);
            window.removeEventListener('scroll', positionFn);
        };
    }

    /*
        observe when an element is visible in it's container or viewport.
        @param {HTMLElement} targetElement - The element to observe
        @param {Function} onHidden - Called when element is not visible
        @returns {Function} cleanup - Call to stop observing
    */
    function observeVisibility(targetElement, onHidden) {
        const isOpen = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) {
                onHidden();
            }
        }, { root: null, threshold: 0 });

        isOpen.observe(targetElement);

        return () => isOpen.disconnect();
    }

    return { observeScrollPosition, observeVisibility };
})();
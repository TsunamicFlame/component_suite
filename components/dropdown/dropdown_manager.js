// imports
import { PortalManager } from "../shared_utility/portal_manager.js";
import { TemplateLoader } from "../shared_utility/template_loader.js";
import { ClickHandlers } from '../shared_utility/click_handlers.js';
import { PositionUtility } from '../shared_utility/position_utils.js';
import { ScrollObserver } from "../shared_utility/scroll_observer.js";


export const DropdownManager = (() => {
    let openDropdowns = new Map(); // Map(triggerElement, dropdownElement) (for quickly finding triggers/elements)
    let dropdownOrder = []; // array of triggers in open order (use as stack) (for ordering elements)

    function openDropdown(triggerButton, options = {}) {
        let dropdownElement;

        // if a DOM element is provided directly, use that.
        if (options.contentElement instanceof HTMLElement) {
            dropdownElement = options.contentElement;
        } else { // else, fall back to loading from template reference via data attributes
            const templateId = triggerButton.dataset.dropdown_id;
            if (!templateId) {
                console.warn(`DropdownManager: No data-dropdown-id and no contentElement provided for trigger`, triggerButton);
                return;
            }
            dropdownElement = TemplateLoader.loadFromDOM(templateId);
        }

/*         // extrapolate template ID from triggerButton attribute
        const templateId = triggerButton.dataset.dropdown-id;

        // Clone from preloaded templates
        const dropdownElement = TemplateLoader.loadFromDOM(templateId);
        if (!dropdownElement) return; */

        if (!dropdownElement) {
            console.warn(`DropdownManager: Dropdown content could not be loaded for trigger`, triggerButton);
            return;
        }
        
        // mount to portal
        dropdownElement.classList.add("dropdown_instance");
        dropdownElement.style.position = 'absolute';
        PortalManager.mountToLayer(dropdownElement, 'dropdowns_portal');

        // get size and position dropdown and build into something we can call to update the position too
        const updatePosition = () => {
            const triggerRect = triggerButton.getBoundingClientRect();
            const elementSize = { width: dropdownElement.offsetWidth, height: dropdownElement.offsetHeight };
            const prefferedMode = triggerButton.dataset.dropdown_mode || 'right';
            const prefferedVertical = 'down'; // could set as attribute if need.

            // find ancestor dropdown rects (rectangles)
            const ancestorRects = getAncestorDropdownRects(triggerButton, openDropdowns);

            const { top, left, mode, vertical } = PositionUtility.calculatePosition(
                triggerRect,
                elementSize,
                prefferedMode,
                prefferedVertical,
                ancestorRects // pass as extra argument
            );

            dropdownElement.style.top = `${top}px`;
            dropdownElement.style.left = `${left}px`;
        }
        updatePosition();

        // needed for closing on scroll out of view
        const closeDropdownFn = () => {
            closeDropdown(triggerButton);
            triggerButton.classList.remove("dropdown_open");
        };

        // reposition on scroll/resize
        const cleanupScroll = ScrollObserver.observeScrollPosition(updatePosition);

        // close if trigger not visible
        const cleanupVisibility = ScrollObserver.observeVisibility(triggerButton, closeDropdownFn)

        const cleanupOutsideClick = ClickHandlers.onClickOutsideDynamic(() => {
            // "inside" check: all currently open triggers and dropdowns
            const activeElements = [];
            openDropdowns.forEach((dropdownElement, triggerElement) => {
                activeElements.push(dropdownElement, triggerElement);
            });
            return activeElements;
        }, (event) => {
            const clickedTrigger = dropdownOrder.find(trigger => trigger.contains(event.target));
            const clickedDropdown = Array.from(openDropdowns.values()).find(dropdown => dropdown.contains(event.target));

            if (!clickedTrigger && !clickedDropdown) {
                // true outside click — close everything
                closeDropdownsFrom(0);
                return;
            }
        });

        // attach event listeners to triggers INSIDE the dropdown (enables nesting)
        dropdownElement.querySelectorAll('.dropdown_trigger').forEach(subTrigger => {
            subTrigger.addEventListener('click', (event) => {
                event.stopPropagation(); // prevent bubbling to outside-click close
                const isOpen = subTrigger.classList.contains("dropdown_open");
                if (isOpen) {
                    closeDropdown(subTrigger);
                    subTrigger.classList.remove("dropdown_open");
                } else {
                    openDropdown(subTrigger);
                    subTrigger.classList.add("dropdown_open");
                }
            });
        });

        // Store cleanup so we can call it later
        dropdownElement.cleanup = () => {
            cleanupOutsideClick(); // Remove outside listeners
            cleanupScroll();
            cleanupVisibility();
        };

        // Track open dropdowns
        openDropdowns.set(triggerButton, dropdownElement);
        dropdownOrder.push(triggerButton);
    }

    // function to close the dropdown
    function closeDropdown(triggerElement) {
        const dropdownElement = openDropdowns.get(triggerElement);
        if (!dropdownElement) return;
        dropdownElement.cleanup?.(); // if necessary, call cleanup handlers
        PortalManager.unmountFromLayer(dropdownElement);
        openDropdowns.delete(triggerElement);
        dropdownOrder = dropdownOrder.filter(t => t !== triggerElement);
    }

    function closeDropdownsFrom(index) {
        // Close dropdowns from `index` to end of chain
        for (let i = dropdownOrder.length - 1; i >= index; i--) {
            const trigger = dropdownOrder[i];
            closeDropdown(trigger);
            trigger.classList.remove("dropdown_open");
        }
    }

    // function to get ancestor and walk up the DOM tree (used for positioning to avoid covering ancestral dropdowns)
    function getAncestorDropdownRects(triggerElement, openDropdowns) {
        const ancestors = [];
        let current = triggerElement.parentElement;
        while (current) {
            // check if this element is one of the dropdowns
            for (let [_, dropdown] of openDropdowns.entries()) {
                if (dropdown === current) {
                    ancestors.push(dropdown.getBoundingClientRect());
                    break;
                }
            }
            // this is what walks it up the DOM tree
            current = current.parentElement;
        }
        return ancestors;
    }

    // click handlers can only do so much, we need to have inside->outside handling, not outside->inside.
    const portalRoot = document.getElementById('dropdowns_portal');

    if (portalRoot) {
        portalRoot.addEventListener('touchstart', portalClickCheck);
        portalRoot.addEventListener('mousedown', portalClickCheck);
    }
    function portalClickCheck(event) {
        // check if click is on any dropdown trigger (ie: could open another dropdown)
        if (event.target.closest('.dropdown_trigger')) { return; }

        // if it's not opening another dropdown, then find out which dropdown was clicked inside
        for (let index = dropdownOrder.length - 1; index >= 0; index--) {
            const trigger = dropdownOrder[index];
            const dropdown = openDropdowns.get(trigger);
            if (dropdown && dropdown.contains(event.target)) {
                // close all children deeper in nesting
                closeDropdownsFrom(index + 1);
                break;
            }
        }
    }

    return { openDropdown, closeDropdown };
})();
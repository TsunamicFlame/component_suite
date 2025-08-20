// imports from shared
import { PortalManager } from "../shared_utility/portal_manager.js";
import { TemplateLoader } from "../shared_utility/template_loader.js";
import { ClickHandlers } from '../shared_utility/click_handlers.js';
import { PositionUtility } from '../shared_utility/position_utils.js';

// imports from dropdowns
import { DropdownManager } from '../dropdown/dropdown_manager.js';


export const SelectManager = (() => {

    function initializeSelects(selectRootElement, config = {}) {
        const state = {
            id: selectRootElement.id || `select_${Math.random().toString(36).slice(2)}`,
            root: selectRootElement,
            type: config.type || selectRootElement.dataset.select_type || "dropdown", // "dropdown" | "flat"
            mode: config.mode || selectRootElement.dataset.select_mode || "single", // "single" | "multi"
            filterable: config.filterable || selectRootElement.dataset.select_filterable === "true",
            required: config.required || selectRootElement.hasAttribute("required"),
            open: false,
            allOptions: [], // flat list: {value, label, group, disabled}
            groupedOptions: [],
            selected: [],
            filter: "",
            hiddenSelect: null,
            menuElement: null,
            containerElement: null,
            inputElement: null,
            activeIndex: -1 // used for keyboard nav
        };

        // normalize data source
        parseOptions(state, config);

        // setup DOM; hidden <select>, container, input, arrow, etc.
        renderContainer(state);

        // attach user event listeners
        attachHandlers(state);

        // store on root for external ref
        selectRootElement.__selectState = state;
    }

    function parseOptions(state, config) {
        // try and find a native <select>
        const nativeSelect = state.root.querySelector("select");
        if (nativeSelect) {
            state.hiddenSelect = nativeSelect;
            state.allOptions = [];
            // if select is multiple, set multi attribute
            if (nativeSelect.multiple) {
                state.mode = "multi";
            }
            // if required, set required attribute
            if (nativeSelect.required) {
                state.required = true;
            }
            Array.from(nativeSelect.children).forEach(node => {
                if (node.tagName.toLowerCase() === "optgroup") {
                    const groupLabel = node.label;
                    Array.from(node.children).forEach(option => {
                        state.allOptions.push({
                            value: option.value,
                            label: option.textContent,
                            group: groupLabel,
                            disabled: option.disabled
                        });
                    });
                } else if (node.tagName.toLowerCase() === "option") {
                    state.allOptions.push({
                        value: node.value,
                        label: node.textContent,
                        group: null,
                        disabled: node.disabled
                    });
                }
            });
        }
        // else if config.options povided (JSON source)
        else if (config.options && Array.isArray(config.options)) {
            state.hiddenSelect = document.createElement("select");
            // if select is multi, set multiple attribute
            if (state.mode === "multi") {
                state.hiddenSelect.multiple = true;
            }
            // set name and id for form submission
            state.hiddenSelect.name = config.name || state.id;
            state.hiddenSelect.id = config.id || state.id + "_hidden";
            // if required, set required attribute
            if (state.required) {
                state.hiddenSelect.required = true;
            }
            /* state.hiddenSelect.style.display = "none"; */ // native selects are hidden by CSS
            state.root.appendChild(state.hiddenSelect);
            config.options.forEach(option => {
                state.allOptions.push(option);
                const optionElement = document.createElement("option");
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                state.hiddenSelect.appendChild(optionElement);
            });
        }
        // TODO: handle optgroup grouping
        state.groupedOptions = groupOptions(state.allOptions);
    }

    function groupOptions(optionList) {
        const grouped = {};
        optionList.forEach(option => {
            const group = option.group || "__NOGROUP__";
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push(option);
        });
        return Object.entries(grouped).map(([group, options]) => ({
            label: group === "__NOGROUP__" ? null : group,
            options: options
        }));
    }

    function renderContainer(state) {
        /*
        Renders the select UI: input box (with pills for multi-select), dropdown arrow,
        and flat menu if applicable. Does NOT directly render dropdown menus for dropdown type.
        All click/keyboard handlers are attached here.
        This function should be called whenever the select state changes.
        */

        //remove old container if exists
        if (state.containerElement) {
            state.containerElement.remove();
        }

        // container wraps the whole select UI
        const container = document.createElement("div");
        container.className = "select-container " + state.type; // "dropdown" | "flat"
        container.setAttribute("role", "combobox");
        container.setAttribute("aria-haspopup", "listbox");
        container.setAttribute("aria-expanded", "false");
        container.setAttribute("aria-required", state.required);

        // input area (show pills for multi, text for single) (also acts as trigger for dropdowns)
        const input = document.createElement("div");
        input.className = "select-input";
        input.tabIndex = 0; // make it focusable

        // for multi, show pills for each selected option
        if (state.mode === "multi") {
            state.selected.forEach(option => {
                const pill = document.createElement("span");
                pill.className = "select-pill";
                pill.textContent = option.label;
                const remove = document.createElement("button");
                remove.className = "select-pill-remove";
                remove.onclick = e => {
                    e.stopPropagation();
                    state.selected = state.selected.filter(o => o.value !== option.value);
                    syncToHiddenSelect(state);
                    renderContainer(state); // re-render UI to reflect changes
                };
                pill.appendChild(remove);
                input.appendChild(pill);
            });
        } else if (state.selected.length === 1) {
            // single select, show the selected label
            input.textContent = state.selected[0].label;
        } else {
            // placeholder for empty single input
            input.textContent = state.filterable ? "Select an option..." : "No selection";
        }

        // attach input to container before checking if flat to ensure input displays above menu
        container.appendChild(input);

        // add dropdown arrow if dropdown type
        if (state.type === "dropdown") {
            const arrow = document.createElement("span");
            arrow.className = "select-arrow";
            input.appendChild(arrow);
        }

        // flat version renders the menu inline
        if (state.type === "flat") {
            const menu = buildMenu(state);
            container.appendChild(menu);
        }

        //attach container to the root
        state.root.appendChild(container);

        // store references for later use
        state.containerElement = container;
        state.inputElement = input;

        // attach handlers
        attachHandlers(state);
    }

    function attachHandlers(state) {
        /*
        Attaches event handlers for input/clikcs/keyboard based on select type.
        Handles opening the dropdown menu (via DropdownManager) for dropdown type.
        Handles keyboard navigation and filtering if neccessary.
        */

        // for dropdown: clicking the input opens the dropdown
        state.inputElement.addEventListener("click", () => {
            if (state.type === "dropdown") {
                openDropdownType(state); // mount via dropdown manager
            }
        });

        // filtering
        state.inputElement.addEventListener("click", () => {
            if (state.filterable) {
                state.inputElement.addEventListener("input", element => {
                    state.filter = element.target.value;
                    applyFilter(state);
                    if (state.open) {
                        //rebuild the menu
                        if (state.menuElement) state.menuElement.remove();
                        const menu = buildMenu(state);
                        if (state.type === "dropdown") {
                            // remount via dropdown manager for correct positioning
                            DropdownManager.openDropdown(state.inputElement, {
                                contentElement: menu,
                                onClose: () => {
                                    state.open = false;
                                    state.containerElement.setAttribute("aria-expanded", "false");
                                }
                            });
                        } else {
                            state.root.appendChild(menu);
                        }
                        state.menuElement = menu;
                    }
                })
            }
        });

        // for keyboard nav
        state.inputElement.addEventListener("keydown", e => {
            if (!state.open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                if (state.type === "dropdown") openDropdownType(state);
                e.preventDefault();
                return;
            }

            if (e.key === "ArrowDown") {
                moveActive(state, 1);
                e.preventDefault();
            } else if (e.key === "ArrowUp") {
                moveActive(state, -1);
                e.preventDefault();
            } else if (e.key === "Enter" && state.activeIndex >= 0) {
                const options = state.menuElement.querySelectorAll(".select-option");
                if (options[state.activeIndex]) options[state.activeIndex].click();
                e.preventDefault();
            } else if (e.key === "Escape") {
                if (state.type === "dropdown") DropdownManager.closeDropdown(state.inputElement);
                e.preventDefault()
            } else if (e.key === "Backspace" && state.mode === "multi" && state.inputElement.value === "") {
                //remove last chip
                const last = state.selected[state.selected.length - 1];
                if (last) {
                    state.selected.pop();
                    syncToHiddenSelect(state);
                    renderContainer(state);
                }
            }
        });
    }

    function openDropdownType(state) {
        /*
        For dropdown selects ONLY.
        This function builds the menu, attaches handlers, then hands off to DropdownManager
        to mount the menu as a floating portal, positiion it, and handle closing.
        */

        if (state.open) return; // prevent double opening
        const menu = buildMenu(state); // build AND attach handlers FIRST!
        state.menuElement = menu;
        // mount via dropdown manager
        DropdownManager.openDropdown(state.inputElement, {
            contentElement: menu,
            onClose: () => {
                state.open = false;
                state.containerElement.setAttribute("aria-expanded", "false");
            }
        });
        state.open = true;
        state.containerElement.setAttribute("aria-expanded", "true");
    }

    function filterOptions(state) {
        const term = state.filter.trim().toLowerCase();
        if (!term) {
            return state.allOptions;
        }
        return state.allOptions.filter(option =>
            option.label.toLowerCase().includes(term) ||
            option.value.toLowerCase().includes(term)
        );
    }

    function applyFilter(state) {
        const regex = new RegExp(state.filter, "i"); // i => case-insensitive
        const filtered = state.allOptions.filter(option => {
            return regex.test(option.label) || regex.test(option.value);
        });
        state.groupedOptions = groupOptions(filtered);
    }

    function buildMenu(state) {
        /*
        Builds the menu DOM (options list) for either dropdown or flat type.
        Returns a DOM node with all options and handlers attached.
        This function should NEVER insert the menu into the DOM for dropdowns directly.
        For dropdowns, the menu is passed to DropdownManager for portal mounting.
        */

        const menu = document.createElement("div");
        menu.className = "select-menu" + (state.type === "flat" ? " flat" : " dropdown");
        menu.setAttribute("role", "listbox");

        // grouped or ungrouped options
        state.groupedOptions.forEach(group => {
            if (group.label) {
                const groupElement = document.createElement("div");
                groupElement.className = "select-group-label";
                groupElement.textContent = group.label;
                menu.appendChild(groupElement);
            }
            group.options.forEach(option => {
                const optionElement = document.createElement("div");
                optionElement.className = "select-option";
                optionElement.textContent = option.label;
                optionElement.setAttribute("role", "option");

                // mark as selected if option is chosen
                if (state.selected.some(o => o.value === option.value)) {
                    optionElement.classList.add("selected");
                }

                // mark as disabled if option is disabled
                if (option.disabled) {
                    optionElement.setAttribute("aria-disabled", "true");
                    optionElement.classList.add("disabled");
                } else {
                    // click handler for selecting option
                    optionElement.addEventListener("click", e => {
                        e.stopPropagation(); // prevent closing dropdown on click
                        handleOptionSelect(state, option);
                    })
                }
                menu.appendChild(optionElement);
            });
        });

        return menu;
    }

    function handleOptionSelect(state, option) {
        /*
        Handles the logic for selecting an optiion (single or multi).
        For dropdowns, closes the dropdown after selection.
        */
/*         if (state.mode === "single") {
            state.selected = [option];
            syncToHiddenSelect(state);
            if (state.type === "dropdown") {
                DropdownManager.closeDropdown(state.inputElement);
            }
        } else { // multi
            const exists = state.selected.find(opt => opt.value === option.value);
            if (exists) {
                state.selected = state.selected.filter(opt => opt.value !== option.value);
                renderContainer(state);
            } else {
                state.selected.push(option);
            }
            syncToHiddenSelect(state);
        } */
        if (state.mode === "single") {
            // if already selected, allow deselect
            if (state.selected.length === 1 && state.selected[0].value === option.value) {
                state.selected = [];
            } else {
                state.selected = [option];
            }
            syncToHiddenSelect(state); // update hidden select with new selection
            if (state.type === "dropdown") {
                DropdownManager.closeDropdown(state.inputElement);
            }
            renderContainer(state); // re-render to update UI
        } else {
            // multi-select: toggle selection
            const exists = state.selected.find(opt => opt.value === option.value);
            if (exists) {
                state.selected = state.selected.filter(opt => opt.value !== option.value);
            } else {
                state.selected.push(option);
            }
            syncToHiddenSelect(state); // update hidden select with new selection
            renderContainer(state); // re-render to update UI
        }
    
    }

    function syncToHiddenSelect(state) {
        /*
        Syncronizes the hidden <select> element for form submissions.
        Ensure the DOM <select> reflects the current selected option(s).
        */
        if (!state.hiddenSelect) return;
        const selectedValues = state.selected.map(selected => selected.value);
        Array.from(state.hiddenSelect.options).forEach(option => {
            option.selected = selectedValues.includes(option.value);
        });
    }

    function moveActive(state, delta) { // used for keyboard nav
        const options = state.menuElement ? [...state.menuElement.querySelectorAll(".select-option:not([aria-disabled='true'])")] : [];
        if (!options.length) return;
        state.activeIndex = (state.activeIndex + delta + options.length) % options.length;
        options.forEach((option, index) => {
            option.classList.toggle("active", index === state.activeIndex);
            if (index === state.activeIndex) option.scrollIntoView({ block: "nearest" });
        });
    }

    return { initializeSelects };
})();
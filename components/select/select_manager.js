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
            state.hiddenSelect.style.display = "none";
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
/* old version
    function renderContainer(state) {
        // clear existing UI except native select
        Array.from(state.root.children).forEach(child => {
            if (child.tagName.toLowerCase() !== "select") child.remove();
        });

        const container = document.createElement("div");
        container.className = "select-container";
        container.setAttribute("role", "combobox");
        container.setAttribute("aria-haspopup", "listbox");
        container.setAttribute("aria-expanded", "false");

        // inputs (acts as trigger for dropdown type)
        const input = document.createElement("input");
        input.type = "text";
        input.className = "select-input";
        input.readOnly = !state.filterable;
        container.appendChild(input);

        // arrow for dropdown type
        if (state.type === "dropdown") {
            const arrow = document.createElement("span");
            arrow.className = "select-arrow";
            container.appendChild(arrow);
        }

        // chips for multi
        if (state.mode === "multi") {
            const chipsDiv = document.createElement("div");
            chipsDiv.className = "select-chips";
            state.selected.forEach(selection => {
                const chip = document.createElement("span");
                chip.className = "select-chip";
                chip.textContent = selection.label;
                const removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.className = "select-chip-remove";
                removeBtn.innerHTML = "&times;";
                removeBtn.addEventListener("click", () => {
                    state.selected = state.selected.filter(s => s.value !== selection.value);
                    syncToHiddenSelect(state);
                    renderContainer(state); // render UI
                });
                chip.appendChild(removeBtn);
                chipsDiv.appendChild(chip);
            });
            container.appendChild(chipsDiv);
        }

        state.root.appendChild(container);
        state.containerElement = container;
        state.inputElement = input;
    }
 */
    function renderContainer(state) {
        //remove old container if exists
        if (state.containerElement) {
            state.containerElement.remove();
        }

        // container wraps the whole select UI
        const container = document.createElement("div");
        container.className = "select-container " + state.type; // "dropdown" | "flat"

        // input area (show pills for multi, text for single)
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
                const removeIcon = document.createElement("span");
                removeIcon.className = "select-pill-remove-icon";
                remove.onclick = e => {
                    e.stopPropagation();
                    state.selected = state.selected.filter(o => o.value !== option.value);
                    syncToHiddenSelect(state);
                    renderContainer(state); // re-render to update UI
                };
                remove.appendChild(removeIcon);
                pill.appendChild(remove);
                input.appendChild(pill);
            });
        } else if (state.selected.length === 1) {
            // single select, show the selected label
            input.textContent = state.selected[0].label;
        } else {
            input.textContent = state.filterable ? "Select an option..." : "No selection";
        }

        // flat version renders the menu inline
        if (state.type === "flat") {
            const menu = document.createElement("div");
            menu.className = "select-menu flat";
            state.groupedOptions.forEach(group => {
                if (group.label) {
                    const groupLabel = document.createElement("div");
                    groupLabel.className = "select-group-label";
                    groupLabel.textContent = group.label;
                    menu.appendChild(groupLabel);
                }
                group.options.forEach(option => {
                    const optionDiv = document.createElement("div");
                    optionDiv.className = "select-option";
                    optionDiv.textContent = option.label;
                    optionDiv.setAttribute("role", "option");
                    if (option.disabled) {
                        optionDiv.setAttribute("aria-disabled", "true");
                        optionDiv.classList.add("disabled");
                    }
                    if (state.selected.some(o => o.value === option.value)) {
                        optionDiv.classList.add("selected");
                    }
                    optionDiv.addEventListener("click", () => {
                        if (option.disabled) return; // ignore disabled options
                        if (state.mode === "multi") {
                            //toggle selection
                            if (state.selected.some(o => o.value === option.value)) {
                                state.selected = state.selected.filter(o => o.value !== option.value);
                            } else {
                                state.selected.push(option);
                            }
                        } else {
                            state.selected = [option]; // single select
                        }
                        syncToHiddenSelect(state);
                        renderContainer(state); // re-render to update UI
                    });
                    menu.appendChild(optionDiv);
                });
            });
            container.appendChild(menu);
        }

        //attach input and container
        container.appendChild(input);
        state.root.appendChild(container);

        // store references
        state.containerElement = container;
        state.inputElement = input;
        state.inputElement.setAttribute("role", "combobox");

    }

    function attachHandlers(state) {
        // open menu on click
        state.inputElement.addEventListener("click", () => {
            if (state.type === "dropdown") {
                openDropdownType(state);
            } else {
                toggleFlatMenu(state);
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

        // outside click for flat version
        if (state.type === "flat") {
            ClickHandlers.onClickOutside([state.root], () => closeFlatMenu(state));
        }

        // for keyboard nav
        state.inputElement.addEventListener("keydown", e => {
            if (!state.open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                if (state.type === "dropdown") openDropdownType(state);
                else toggleFlatMenu(state);
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
                else closeFlatMenu(state);
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
        if (state.open) return;
        const menu = buildMenu(state);
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

    function toggleFlatMenu(state) { // for flat type: inline menu
        if (state.open) {
            closeFlatMenu(state);
        } else {
            const menu = buildMenu(state);
            state.root.appendChild(menu);
            state.menuElement = menu;
            state.open = true;
            state.containerElement.setAttribute("aria-expanded", "true");
        }
    }

    function closeFlatMenu(state) {
        if (state.menuElement) state.menuElement.remove();
        state.menuElement = null;
        state.open = false;
        state.containerElement.setAttribute("aria-expanded", "false");
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
        const menu = document.createElement("div");
        menu.className = "select-menu";
        menu.setAttribute("role", "listbox");

        state.groupedOptions.forEach(group => {
            if (group.label) {
                const groupElement = document.createElement("div");
                groupElement.className = "select-group";
                groupElement.textContent = group.label;
                menu.appendChild(groupElement);
            }
            group.options.forEach(option => {
                const optionElement = document.createElement("div");
                optionElement.className = "select-option";
                optionElement.textContent = option.label;
                optionElement.setAttribute("role", "option");
                if (option.disabled) {
                    optionElement.setAttribute("aria-disabled", "true");
                } else {
                    optionElement.addEventListener("click", () => {
                        handleOptionSelect(state, option);
                    });
                }
                menu.appendChild(optionElement);
            });
        });

        return menu;
    }

    function handleOptionSelect(state, option) {
        if (state.mode === "single") {
            state.selected = [option];
            syncToHiddenSelect(state);
            if (state.type === "dropdown") {
                DropdownManager.closeDropdown(state.inputElement);
            } else {
                closeFlatMenu(state);
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
        }
    }

    function syncToHiddenSelect(state) {
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
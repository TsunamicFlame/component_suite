// imports
import { DropdownManager } from "./components/dropdown/dropdown_manager.js";
import { TemplateLoader } from './components/shared_utility/template_loader.js';
import { SelectManager } from "./components/select/select_manager.js";



//____________________________________________________________________________________________________________________________
// TOGGLE LIGHT / DARK THEME
document.addEventListener("DOMContentLoaded", function () {
    const themeToggleButtons = document.querySelectorAll(".theme-toggle-btn");
    const htmlElement = document.documentElement;

    // Detect and apply stored or system theme
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentTheme = storedTheme ? storedTheme : (prefersDark ? "dark" : "light");

    applyTheme(currentTheme);

    // Loop through all toggle buttons and add click event
    themeToggleButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const newTheme = htmlElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(newTheme);
        });
    });

    function applyTheme(theme) {
        htmlElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        // Update all toggle buttons
        themeToggleButtons.forEach(function (btn) {
            btn.classList.toggle("dark-mode", theme === "dark");
        });
    }
});


//____________________________________________________________________________________________________________________________
// MANAGE DROPDOWNS

// Add event listeners to dropdown trigger buttons
document.querySelectorAll(".dropdown_trigger").forEach(button => {
    button.addEventListener("click", () => {
        const templateId = button.getAttribute("dropdown-id");
        const mode = button.getAttribute("dropdown-mode") || "right"; // default to "right" if not specified
        const isOpen = button.classList.contains("dropdown_open");

        // close all dropdowns from ths trigger if already open
        if (isOpen) {
            DropdownManager.closeDropdown(button);
            button.classList.remove("dropdown_open");
        } else {
            // open new dropdown
            DropdownManager.openDropdown(button);
            button.classList.add("dropdown_open");
        }
    });
});

//____________________________________________________________________________________________________________________________
// Control selects on page

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".select").forEach(el => {
        SelectManager.initializeSelects(el);
    });
});

//____________________________________________________________________________________________________________________________
// Control tabs on page
document.addEventListener("DOMContentLoaded", () => {
    activateFirstTab();
});
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.tab_button');
    if (!btn) return;

    const container = btn.closest('[class*="tab_container"]');
    if (!container) return;

    const buttons = container.querySelectorAll('.tab_button');
    const contents = container.querySelectorAll('.tab_content');

    // clear all active states
    buttons.forEach(b => b.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // activate the clicked button
    btn.classList.add('active');

    // enable the related tab content
    const targetTabId = btn.dataset.tab_id;
    const targetContent = container.querySelector(`#${targetTabId}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
});
function activateFirstTab(container = document) { // call on page load to activate the first tab in a group
    const containers = container.querySelectorAll('[class*="tab_container"]');
    containers.forEach(c => {
        const buttons = c.querySelectorAll('.tab_button');
        const contents = c.querySelectorAll('.tab_content');
        if (buttons.length && contents.length) {
            buttons[0].classList.add('active');
            contents[0].classList.add('active');
        }
    });
}

//____________________________________________________________________________________________________________________________
// Load templates once on page load

await TemplateLoader.loadExternal('./components/dropdown/dropdown_templates.html'); //dropdown templates
/* await TemplateLoader.loadExternal('./components/select/select_templates.html'); //select templates */
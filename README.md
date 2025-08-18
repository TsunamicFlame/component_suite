# Component Suite

This has been a personal project of mine, to develop a suite of components that don't need to be used as one big thing, but can be picked as necessary to build basic webapp functionality while keeping things light on the end user's device. I've made this public so that if anyone else finds any use out of these, they're able to use them as they'd like, but I'll be honest, this has been my way of learning how to code, and some of this has been AI assisted. I don't want to call it 'vibecoded' because none of this is a direct copy and paste of AI code, but that doesn't mean that the methodology and some of the more complex functions weren't developed using AI assistance.

Here's a breakdown of what the end goal of all of these components are:
<h3>
This is a breakdown of the functions expected by the components in this suite.</h3>
<p>
The components will be listed, with their functionality bolded. The point of this document is to fully explain the purpose of each component and their function in a simple and digestible method.
</p>
<p>
See below for a complete list of the shared functions of these components and their descriptions. It would take up too much space to repeat the descriptions of all of the shared functions, so their descriptions will be found here. If a component has a function that is specific to that component, then it will be described in that component's section.
</p>
<p>
<b>Note:</b> in this context, function does not describe a JavaScript function, instead "function" is used to describe the end user's understanding of how the component can be used/interacted with. This means that the "functions" described below may be made of several JavaScript functions working together to acheive the desired result. For example; "Smart Closing" includes several conditions, including a scroll observer and a onClickOutside function. Sometimes, they will just be describing functionality of the components, and may not actually include much or any JavaScript, such as the "Hidden Outputs" which describes some of the interactive components mirroring their outputs to their default HTML counterparts, this contains some html, but it is also just describing the necessity of having hidden HTML output elements attached to each of the applicable custom components.
</p>
<p>
<b>Note:</b> "Pickers" refers to all three of the different pickers (color picker, date picker, time picker) in this component suite.
</p>
<hr>
<details open>
<summary><b>Shared Function Descriptions</b></summary>
<uL>
<li>
<b>Mobile Compatability</b>
<i>Pickers / Dialogs / Sidebars / Toasts / Tooltips / Dropdowns / Selects</i>
<p>
These components are REQUIRED to be compatible with mobile devices. This means that each component will either be built to have two versions of itself, one for desktop and one for mobile, or they will be built to dynamically adjust themselves to the user's device type. This is something that will be determined by the complexity of any specific component. For example, the pickers will likely have separate versions, however the sidebars can be dynamically adjusted to fill more of the viewport if the user is on mobile.
</P>
</li>
<li>
<b>Template Management</b>
<i>Pickers / Dialogs / Sidebars / Toasts / Tooltips / Dropdowns / Selects</i>
<p>
These components all display data that they're getting from somewhere, some of these components can gather their data from JSON delivered to them via API, but at the very least, it's good to have backups, which means that all of these components can use this shared utility to access HTML templates of their component, this can be useful in the case of dropdowns, so an especially complex dropdown can be saved as a template in a seperate file, then referenced by all of the different pages of the webapp. This makes editing that dropdown much easier since there's only one to edit, instead of one per page.
</P>
</li>
<li>
<b>Smart Positioning</b>
<i>Pickers / Dialogs / Sidebars / Toasts / Tooltips / Dropdowns / Selects</i>
<p>
This component makes sure that when it is rendered, it's done so in a way that makes sure it's within the boundaries of the viewbox. Part of making sure it stays in the viewbox is knowing if it needs to be below, above, to the left, or right of it's parent button. This component will also update it's positioning when it's parent button is scrolled/moved.
</P>
</li>
<li>
<b>Smart Closing</b>
<i>Pickers / Dialogs / Sidebars / Toasts / Dropdowns / Selects</i>
<p>
This component knows when to close itself. If the parent button that was clicked to open this component is scrolled out of view, either by the viewbox or if the parent button is within a dialog and was scrolled out of the visible area of that dialog. It will also close itself if there is a click outside of the component, or if the component's "close button" is clicked.
</P>
</li>
<li>
<b>Smart Focusing</b>
<i>Pickers / Dialogs / Sidebars / Toasts / Dropdowns / Selects</i>
<p>
When this component is open, it must be focus trapped. The goal of this component suite is maximum accessibility, which means that the whole application must be utilable with just the keyboard if neccessary.
</P>
</li>
<li>
<b>Hidden Outputs</b>
<i>Pickers / Selects</i>
<p>
These components are replacements of default HTML inputs with browser based pickers / lists. However, we can save a lot of work by not building an entirely custom way of saving and displaying that output data. So these components will mirror their ouput to a hidden HTML input element of the same type (custom select will mirror to an HTML select tag, a custom color picker will mirror to a default HTML input[type="color"], etc.). This however does NOT mean that these components do not display their outputs, each component will display their output, however when a form is submitted, the data that will be gathered for that submission will be from the hidden outputs, not the custom displays.
</P>
</li>
</ul>
</details>
<hr>
<details>
<summary><b>Pickers (Color / Date / Time)</b></summary>
<p>
The pickers are custom replacements for the default HTML pickers. As with all default html inputs that involve browser based pickers, the control over the visual style of them is non-existent. These custom pickers solves that issue, maintaining all of the functionality of the basic HTML pickers, but with a customizable UI.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Automated Data Povision</b>
<p>
All of the picker components should be built using JavaScript. There should be no manual creation in the data within them, as a calendar is a calendar, a time picker is a time picker, and a color picker is a color picker. These need no manual values to be described, but it is important to reafirm that they will be built with JavaScript, and their interactability will be accessible to the highest level.
</P>
</li>
<li>
<b>Date Picker - Two types</b>
<p>
The date picker will have two types. The first wil be just a date picker, and the second will be a range picker, which allows the user to pick a start date and an end date within the same picker, instead of needing to navigate between two inputs.
</P>
</li>
<li>
<b>Time Picker - Two types</b>
<p>
The time picker will have two types. The first wil be just a time picker, and the second will be a range picker, which allows the user to pick a start time and an end time within the same picker, instead of needing to navigate between two inputs.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Dropdowns</b></summary>
<p>
The dropdown components are unique in that they are used for more than just navigation. Much of their functionality is shared with the custom select component, as they are quite similar in their interaction method, however, the custom select component is just an input for a form, this dropdown component can be so much more. The dropdowns are able to contain anything, not just a menu or list, they can be anything you can put in there, since clicking the inside of the dropdown doesn't close it, and dropdowns can be nested to infinity.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Infinite Nesting</b>
<p>
Dropdowns need to be able to nest infinitely, this enables the creator unlimited freedom in their creation process.
</P>
</li>
<li>
<b>Smart Nesting</b>
<p>
In addition to the aforementioned infinite nesting, the most important thing is that nested dropdowns, behave almost identically to non-nested dropdowns. They are still focus trapped, they still smart position (with the added detail of making sure they try to not cover up their ancestor dropdowns), but they have a few extra quirks as well. The main one is this, clicking on a dropdown's parent (or any ancestor dropdown) will close all child dropdown up to the clicked ancestor. For example, in a chain of 5 dropdowns where all 5 are opened, if the user clicked on dropdown 3, the children of dropdown 3 (dropdowns 4 and 5) would be closed. This is also true with the existing smart closing of the dropdowns, if a parent dropdown is closed because it is scrolled out of view, then the children of the dropdown should be closed as well.
</P>
</li>
<li>
<b>Close Actions</b>
<p>
The dropdown component does have the shared "smart closing" functionality, however it also has one additional parameter: Close Actions. Since the dropdowns are not closed when anything is clicked within them, this could lead to situations where a modal dialog is opened from a dropdown, but the dropdown remains open because nothing was clicked outside of it. This cannot be fixed by just having any button click close the dropdown, as that would complicate nesting, the solution is then to have buttons within a dropdown that when clicked, would also trigger the closure of the dropdown. These buttons are tagged as a button with a "close action". This ensures that the components stay siloed while still providing enhanced interactivity.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Dialogs</b></summary>
<p>
The dialog component is also known as a "modal" however since modality is more of a function, we have elected to call them dialogs instead. The dialog is a component that displays as a box in front of (dialogs have a higher z-index) the main body of the webapp. Dropdowns, selects, pickers, toasts, and tooltips are higher than dialogs in the z-index order, which means they act functionally similar to the main body of the webapp. Dialogs can have two types: locked, and free. A locked dialog cannot be closed by clicking outside of the dialog area, the user must click the close button to close the dialog. The free dialog type can be closed by clicking outside of the dialog.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Locked vs Free States</b>
<p>
The dialogs can be marked as either locked or free which changes the way the user interacts with them to close the dialog. In a locked modal a close button must be pressed to close the dialog. This close button can be an actual button with the label "close" but it can also be a "save info" button, or any other button. The button that is clicked to close the dialog is determined by an HTML tag that can be on any button, not by a specific type of button. In the free type of dialog, the dialog can be closed by clicking outside of the dialog. In either type of dialog, if there is unsubmitted form data in the dialog, the dialog will throw an alert to the user about the form data, which the user can either confirm their closure of the dialog, or go back and finish the form before attempting to close the dialog again.
</P>
</li>
<li>
<b>Custom Resize</b>
<p>
The dialogs can also use a custom HTML tag that uses a boolean to determine if the dialog can be resized by the user or not.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Sidebars</b></summary>
<p>
The sidebar component is a simple one. An element that is the hight of the viewbox (minus the header) that can slide in from either the right or left side depending on how it is tagged. The sidebar is just a container for any kind of content. It exists in the z-index order underneath the dialogs, which ensure that all interactive components can be displayed over it. Clicking outside of the sidebar will close it, there are no special locked/free states here. The sidebar exists only to display data. The two special aspects of the sidebar are these: the sidebar can slide in from either the right or the left, and the sidebar has three distinct widths (on desktop, on mobile they only appear to take up most of the screen), as well as can use custom HTML tags to mark if the sidebar width can be controlled by the user (within certain bounds).
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Right and Left States</b>
<p>
The sidebars can use custom HTML tags to denote whether it should slide in on either the left or the right of the viewbox.
</P>
</li>
<li>
<b>Custom widths</b>
<p>
The sidebars can use custom HTML tags to denote either three static widths, which essentially are a small, medium, and large, as well as another tag which is a boolean that toggles the user's ability to manually click and drag the edge of the sidebar to make it wider or thinner. These of course are within certain bounds, so the user can't make the sidebar 2px wide for example. The custom width of the sidebar should also be saved so that it will be that width the next time the user accesses the site.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Selects</b></summary>
<p>
The custom select component is one of the more complex components due to several factors; the first of these being that it must be able to gather data from two sources, either from JSON delivered to the component via API (likely through Supabase) or from HTML templates. In addition to these data gathering issues, it must also take one of several forms. The idea with the custom select component is to make form filling out much more fluid, and that is enabled by the sheer customizability this component offers. The custom selects will need to use several custom HTML tags to determine what kind of select it will be. Will it be a dropdown or flat? single or multi select? grouped options or ungrouped options? filterable or not filterable? These are all of the types that the custom select can be, and why it is so complicated. It will also get it's required state either from the JSON or from the html template, which will be tagged with "required" if it is so. That tag (or the data from the JSON) will define the required state of each select component.
</p>
<p>
It is also important to note visually how this component will function, since it has so many different options, this severely impacts it's styling. One of the ways that we make sure that these things are standardized within the chaos is that no matter what, all of the custom selects are centered around a parent input box. This input box is where the output of the select is displayed, and it is also what is used when text filtering is enabled. In multi-select situations, the selected options will appear in pills in the input box, each pill will have an 'x' to remove it, but they can also be removed by using the keyboard backspace button to remove them just like if they were text.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Data Gathering</b>
<p>
The custom selects can either gather the data they will display in their options from two sources, either from HTML templates stored in a seperate file (see "template management" in the shared utility section), or from JSON that's delivered to this component via API, generally this will be from a POSTGRES database such as Supabase, however it ideally will be able to interact with any databases with the right tweaks.
</P>
</li>
<li>
<b>Dropdown or Flat visual display</b>
<p>
The custom selects can either be defined as a dropdown or as a flat list using a custom HTML tag, if it is a dropdown, then when the user begins an interaction with the input box, the dropdown is displayed either below or above it (depending on the space using the shared utility of "smart positioning") and the user can interact with the options in the list. In a flat display, the options are already visible below the input box, they appear as just another div in the main body of the parent element, the flat options list does not appear over anything, but at the same level, ensuring that nothing is hidden on accident.
</P>
</li>
<li>
<b>Single and Multi Select Options</b>
<p>
The custom selects can either be defined as a single or multi select using a custom HTML tag, if it is a single select, then the user is only able to click one option. If the component is a multi-select, then the user is able to pick as many options as they want. The selected options will appear in the input box as the user selects them, each selected option in the input box will appear as a pill with an 'x' button to remove them with the mouse, or the user can use the keyboard backspace button (or arrow keys to manuver between options, if the input box is in focus, if not arrow keys will just go up and down the options list) to remove them as if they were text.
</P>
</li>
<li>
<b>Grouped and Ungrouped Options</b>
<p>
The custom selects can either be defined as either having grouped or ungrouped options using a custom HTML tag, if a select has grouped options, then each option in each group will appear under that group's heading. This is a direct replication of the default HTML select "optgroup". If there is no grouping, then options are just displayed in a list.
</P>
</li>
<li>
<b>Filterable and Unfilterable Selects</b>
<p>
The custom selects can either be defined as filterable or unfilterable using a custom HTML tag. If it is filterable, then the user can interact with the input box as an input box and begin to type, the list (doesn't matter if it's flat or a dropdown) will begin to filter matching options to the user's text input. THE USER WILL NEVER BE ALLOWED TO ADD CUSTOM OPTIONS. If an option from the list isn't available with the user's filter, then the input MUST NOT be mirrored to the hidden input. The filter should not be case sensitive nor require a whole word, and should fuzzy match if possible. If the select is unfilterable, then the user interacts with the input box like it is a button which focuses the options list, interacting with the input using the keyboard will also focus the options list for that select.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Toasts</b></summary>
<p>
Toasts are simple. Small notifications that can be positioned depending on the creator's choice. There are several types of toasts, and they also have some expanded functionality on the smart positioning side of things. The purpose of toasts is to display notifications and alerts/warnings and "saved" updates.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Position Direction</b>
<p>
Toasts can be tagged with a custom HTML tag that determines if they're positioned in one of eight places in the viewport. They can either be in the top left, top right, top middle, bottom left/right/middle, or on either the left vertical or right vertical at the top/middle/bottom as well. In short, split the screen into nine squares, the Toasts can be placed in any position that is NOT the middle.
</P>
</li>
<li>
<b>Expanded Smart Positioning</b>
<p>
In the instance when the user has multiple toasts in the same quadrant, the toasts need a way of overlapping that still allows them to be seen. Either this is just a vertical scrolling list, where three toasts are visible at a time, or perhaps a vertical carousel or something like that. Either way, they will have a mathod of stacking multiple toasts into the same list as they appear. The key here is that they only stack if they're in the same quadrant, if the user has notifications in the top right, and a saving idcator in the bottom right, these will not join into a list. It's only if there user has more than one notification in the top right that they will join into a list.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Tooltips</b></summary>
<p>
Tooltips should be quite simple items, they exist at a higher z-index than any other component to ensure that they are never hidden behind anything else. They also come in two types: simple, and rich. The simple type is just a short blurb about the item the user is hovering over. The rich type is an expansion on the short blurb, and can include images or a small table. Think of the rich type as a detailed explaination, and the simple type as a summary.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Display on Hover</b>
<p>
The tooltips must be made visible when the user is hovering over a tooltip equiped element for more than 0.4 seconds. If the user moves the cursor off of the tooltip element, then the tooltip is hidden again. 
</P>
</li>
</ul>
</details>
<details>
<summary><b>Maps</b></summary>
<p>
The map is a complex component, basically it's own webapp by itself. The point of this component is to be able to display ANYTHING on a map. The user should be able to draw on it, limit visible items on the map to a drawn area, click a button to go to their location, see map items within a user defined radius of the user's location, zoom in, zoom out, import their own files (CSV/KML/KMZ/etc.) to display on the map, connect to outside sources (allow the user to do this too) to get layers for the map, change the basemap depending on the webapp's data-theme (and allow the user to toggle the labels for the basemap and the layers on and off), have an interactive legend that updates with the current layers and a sublist of each pin for that layer, allow the user to toggle layers on and off, allow the user to change the styling of a layer's pins or to choose between styling all of a layer's pins or grouping pins and styling those groups, or styling each pin individually, the user should also have access to a search bar that returns a list of all matching pins on the map. In short, there's A LOT that this component must take care of, and I'm not sure how much of it can be overlayed with the other components, but I'm hopeful! One last thing about the maps, the goal is to always make sure I can add any of these components into any webapp I'm developing, which means I don't want to be paying to use a google maps API everytime I build this thing. I want this to work off of FREE and ideally open source base maps.
Stretch goals: options to the user to display live traffic, weather, and live track where transit vehicles are on their routes.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Display a map</b>
<p>
The map has to exist for any of this to work. Probably using OpenLayers.
</P>
</li>
<li>
<b>Interactive Legend</b>
<p>
The map has to have an interactive legend, something the user can use to toggle layer visibility, style layer pins (described more later), move layers up and down the priority stack (I'm assuming this would work similarly to z-index, the layers on top display above the layers below), toggle labels per layer, and add and remove layers.
</P>
</li>
<li>
<b>Basemap and layer library</b>
<p>
Since so much of this component is based on user customization, the user should be able to select one of several base map options (each should have a dark mode equivalent) or use a satellite base map instead. The user should also be able to toggle the labels for the base map (and layers) on and off. The user should also have access to a library of not just base maps, but layers they could add to the current map in front of them, think of this like the frequently used area. So instead of needing to go and find new layers, the user can just grab one from the library, drag it into the legend and that layer is now displayed in the map!
</P>
</li>
<li>
<b>Styling of layers/pins</b>
<p>
The customization here is deep, and that is intentional, it allows the user to craft something that is both unique to them, and perfect their own design language. This should mean that the user has access to different ways of styling each layer. They can pick between styling a whole layer as one pin type, styling a group of layers (defined by a shared common factor between pins, for example in a CSV you might have column where many rows have a matching value), or styling pins individually.
</P>
</li>
<li>
<b>Searching live layers</b>
<p>
The map has to have a search bar that has a dropdown list of results that only shows up once the user has interacted with it. This search bar will search through all the layers that are currently visible. So if it's a layer within the legend that has just been temporarily deactivated, it shouldn't show up.
</P>
</li>
<li>
<b>Custom imports</b>
<p>
The map has to allow the user to import their own layers, either from their device or from a link such as this:
<blockquote>https://gismo.spokanecounty.org/arcgis/rest/services/OpenData/Boundary/MapServer/20/query?outFields=*&where=1%3D1&f=geojson
</blockquote>
These imports, if coming from the user's device, should be any file type that is common for GIS work. It should be a CSV, KML, KMZ, Shapefiles, GeoJSON, etc.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Calendars</b></summary>
<p>
This component should do everything you expect calendars to do. This component is almost it's own webapp in it's own right, as it will need to do many things, including the following: display a calendar, allow the user to determine the calendar view (day/week/month), visualize events on days, allow the user to create and edit/update and destroy events, connect to a database to store these events, remind the user of upcoming events, be able to do single events or repeating events, and search through events. In an ideal world, this component could also import calendars from google or outlook.
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Display calendar variation</b>
<p>
The user will select which view (defaults to month) they would like to see the calendar in, day, 3 day, week, 2 week, or month.
</P>
</li>
<li>
<b>event creation/edit/update/delete</b>
<p>
The user will be able to create, edit/update, and destroy events on the calendar. These events can be single time events or repeating events. This component must be able to handle strangly repeating events such as this: "this event takes place on the first and 3rd Wendesday of every other month, and the 2nd Tuesday of every month".
</P>
</li>
<li>
<b>Database connection</b>
<p>
The calendar component must be able to connect to a database to store and reference these calendar events. In an ideal world, this component can also import and store data from google calendar and outlook calendar.
</P>
</li>
</ul>
</details>
<details>
<summary><b>Theme Controls</b></summary>
<p>
Theme control is quite simple, a button that allows the user to toggle between data-themes for the webapp. In an ideal world this should also include tracking which theme the user last visited the in, as well as adjust to the browser's preference if the user hasn't selected a preference themselves. A stretch goal is to create a system to allow the user a CSS editing environment where they can customize the webapp for themselves, or pick between several themed options (minimal/colorful/gamer/light/dark/hacker/etc.)
</p>
<h4>Functionality:</h4>
<uL>
<li>
<b>Toggle Themes</b>
<p>
The theme is toggled between the light and dark mode for the app using a button. It also defaults to the browser's theme if the user has not selected otherwise.
</P>
</li>
<li>
<b>Track Themes</b>
<p>
This component will also track the theme of the browser so if the user hasn't indicated otherwise, it will default to the browser's theme.
</P>
</li>
</ul>
</details>

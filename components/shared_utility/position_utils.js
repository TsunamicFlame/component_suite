/*
This module manages positional functions for the components
*/

export const PositionUtility = (() => {

    /*
        Calculates best position for a floating component (dropdown, tooltip, etc.)
        - Flips direction if needed
        - Avoids covering ancestor elements if possible (uses ancestorRects)
        - Aligned to trigger (top or bottom) as requested
        - Safe for shared use in multiple components

        Arguments:
        - triggerRect (DOMRect)
        - elementSize {width, height}
        - mode: "right" | "left" | "center"
        - vertical: "down" | "up"
        - ancestorRects: [DOMRect, ...] (optional; pass for nested dropdowns)
        - options: { alignToTriggerTop: boolean }
    */

    function calculatePosition(
        triggerRect,
        elementSize,
        mode = "right",
        vertical = "down",
        ancestorRects = [],
        options = {}
    ) {
        const margin = 4;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isNested = ancestorRects && ancestorRects.length > 0;

        // --- Step 1: Decide if we need to flip horizontally ---
        const fitsRight = triggerRect.left + elementSize.width <= viewportWidth - margin;
        const fitsLeft  = triggerRect.right - elementSize.width >= margin;

        let finalMode = mode;
        if (mode === "right" && !fitsRight && fitsLeft) finalMode = "left";
        else if (mode === "left" && !fitsLeft && fitsRight) finalMode = "right";

        // For nested menus:
        if (isNested) {
            // Try to avoid overlap with ancestor dropdowns
            let bestMode = finalMode;
            let minOverlap = Infinity;
            ["right", "left"].forEach(checkMode => {
                // Skip if can't fit at all in this direction
                if (checkMode === "right" && !fitsRight) return;
                if (checkMode === "left" && !fitsLeft) return;

                const trialLeft = checkMode === "right"
                    ? triggerRect.right + window.scrollX
                    : triggerRect.left - elementSize.width + window.scrollX;
                const trialTop = options.alignToTriggerTop
                    ? triggerRect.top + window.scrollY
                    : triggerRect.bottom + window.scrollY;

                const trialBox = {
                    left: trialLeft,
                    right: trialLeft + elementSize.width,
                    top: trialTop,
                    bottom: trialTop + elementSize.height
                };

                let overlapArea = 0;
                ancestorRects.forEach(anc => {
                    const dx = Math.max(0, Math.min(trialBox.right, anc.right) - Math.max(trialBox.left, anc.left));
                    const dy = Math.max(0, Math.min(trialBox.bottom, anc.bottom) - Math.max(trialBox.top, anc.top));
                    overlapArea += dx * dy;
                });

                if (overlapArea < minOverlap) {
                    minOverlap = overlapArea;
                    bestMode = checkMode;
                }
            });

            finalMode = bestMode;
        }

        // --- Step 2: Decide if we need to flip vertically ---
        const fitsDown = triggerRect.bottom + elementSize.height <= viewportHeight - margin;
        const fitsUp   = triggerRect.top - elementSize.height >= margin;

        let finalVertical = vertical;
        if (vertical === "down" && !fitsDown && fitsUp) finalVertical = "up";
        else if (vertical === "up" && !fitsUp && fitsDown) finalVertical = "down";

        // --- Step 3: Calculate coordinates ---
        let left;
        let top;

        if (!isNested) {
            // *** ROOT DROPDOWN POSITIONING RULES ***
            if (finalMode === "right") {
                // align top-left or bottom-left to trigger left
                left = triggerRect.left + window.scrollX;
            } else if (finalMode === "left") {
                // align top-right or bottom-right to trigger right
                left = triggerRect.right - elementSize.width + window.scrollX;
            } else { // center
                left = triggerRect.left + (triggerRect.width / 2) - (elementSize.width / 2) + window.scrollX;
            }

            if (finalVertical === "down") {
                // drop below
                top = triggerRect.bottom + window.scrollY;
            } else {
                // flip upward
                top = triggerRect.top - elementSize.height + window.scrollY;
            }
        } else {
            // *** NESTED DROPDOWN POSITIONING (cascade) ***
            if (finalMode === "right") {
                left = triggerRect.right + window.scrollX;
            } else if (finalMode === "left") {
                left = triggerRect.left - elementSize.width + window.scrollX;
            } else { // center
                left = triggerRect.left + (triggerRect.width / 2) - (elementSize.width / 2) + window.scrollX;
            }

            if (options.alignToTriggerTop) {
                top = triggerRect.top + window.scrollY;
            } else if (finalVertical === "down") {
                top = triggerRect.bottom + window.scrollY;
            } else {
                top = triggerRect.top - elementSize.height + window.scrollY;
            }
        }

        // --- Step 4: Clamp to viewport ---
        left = Math.max(margin, Math.min(left, viewportWidth - elementSize.width - margin));
        top = Math.max(margin, Math.min(top, viewportHeight - elementSize.height - margin));

        return { top, left, mode: finalMode, vertical: finalVertical };

    }

    return { calculatePosition };
})();

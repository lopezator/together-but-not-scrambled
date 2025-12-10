// --- Global State for Toggling ---
let isShuffled = false;
let originalColumns = [];

// Reverting to the known volatile class for the injection target, as it's the only reliable finder.
const EMPTY_BUTTON_SELECTOR = '[class*="toggleEmptyButton"]';
const SHUFFLE_BUTTON_ID = 'shuffle-assignees-btn';

// Selector for the main list container (ul) - using the STABLE selector for reliable list manipulation
const SLICER_LIST_CONTAINER_SELECTOR = 'ul[data-dividers="true"][data-variant="inset"]';


// Function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- Button Injection Function (RE-FIXED LAYOUT) ---
function injectShuffleButton() {
    const emptyButton = document.querySelector(EMPTY_BUTTON_SELECTOR);
    const existingButton = document.getElementById(SHUFFLE_BUTTON_ID);

    if (emptyButton && !existingButton) {

        // 1. Get the parent container
        const parentContainer = emptyButton.parentElement;

        // 2. Create the wrapper for the two buttons
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.justifyContent = 'flex-start';
        wrapperDiv.style.alignItems = 'center';
        wrapperDiv.style.width = '100%'; // Ensure it occupies the full width

        // 3. Clone the existing button structure
        const shuffleButton = emptyButton.cloneNode(true);
        shuffleButton.id = SHUFFLE_BUTTON_ID;

        // 4. Update the text in the cloned button
        const textSpan = shuffleButton.querySelector('[data-component="text"]');
        if (textSpan) {
            textSpan.textContent = 'Together';
        }

        // 5. Clean up and style
        shuffleButton.removeAttribute('aria-describedby');
        shuffleButton.style.marginRight = '8px'; // Spacing
        shuffleButton.style.flexShrink = '0';

        // 6. Use addEventListener for reliable click handling
        shuffleButton.addEventListener('click', toggleColumnOrder);

        // 7. --- CRITICAL FIX: Restructure the DOM Safely ---

        // Insert the wrapper DIV immediately before the original button.
        parentContainer.insertBefore(wrapperDiv, emptyButton);

        // Move the original button INTO the wrapper.
        wrapperDiv.appendChild(emptyButton);

        // Insert our new button before the original button inside the wrapper.
        wrapperDiv.insertBefore(shuffleButton, emptyButton);

        console.log('Shuffle Assignees button injected successfully with robust layout fix.');
        observer.disconnect();
    }
}

// --- CORE LOGIC: Find the Sidebar List Items (Remains stable) ---
function getAssigneeColumns() {
    const columnContainer = document.querySelector(SLICER_LIST_CONTAINER_SELECTOR);

    if (!columnContainer) {
        console.error('Failed to find the sidebar Assignee list container.');
        return { container: null, columns: [], noAssigneesColumn: null };
    }

    const allItems = Array.from(columnContainer.children).filter(el => el.tagName === 'LI');

    let noAssigneesColumn = null;
    let shufflableColumns = [];

    for (const item of allItems) {
        const h3Element = item.querySelector('h3');
        if (h3Element && h3Element.textContent.trim() === 'No Assignees') {
            noAssigneesColumn = item;
        } else {
            shufflableColumns.push(item);
        }
    }

    return {
        container: columnContainer,
        columns: shufflableColumns,
        noAssigneesColumn: noAssigneesColumn
    };
}


function toggleColumnOrder() {
    const { container: columnContainer, columns: shufflableColumns, noAssigneesColumn } = getAssigneeColumns();
    const button = document.getElementById(SHUFFLE_BUTTON_ID);

    const buttonLabel = button ? button.querySelector('[data-component="text"]') : null;

    if (!columnContainer || shufflableColumns.length === 0 || !buttonLabel) {
        alert('Could not find the assignee list items to shuffle or the button label.');
        return;
    }

    let targetColumns;
    let newText;

    if (isShuffled) {
        // 1. RESTORE to original order
        targetColumns = originalColumns;
        newText = 'Together';
        isShuffled = false;
        console.log('Assignee list restored to original order. State: Together, but not scrambled.');
    } else {
        // 2. SHUFFLE
        if (originalColumns.length === 0) {
            originalColumns = [...shufflableColumns];
        }
        targetColumns = shuffleArray(shufflableColumns);
        newText = 'Scrambled!';
        isShuffled = true;
        console.log('Assignee list shuffled successfully. State: Scrambled!');
    }

    // 3. Re-append the nodes to the container in the new order.
    columnContainer.innerHTML = '';

    targetColumns.forEach(column => {
        columnContainer.appendChild(column);
    });

    if (noAssigneesColumn) {
        columnContainer.appendChild(noAssigneesColumn);
    }

    // 4. Update the button text
    buttonLabel.textContent = newText;
}


// --- MutationObserver Setup ---
const observer = new MutationObserver((mutations, obs) => {
    injectShuffleButton();
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });
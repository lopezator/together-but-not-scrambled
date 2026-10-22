// --- Global State for Toggling ---
let isShuffled = false;
let originalColumns = [];

// Reverting to the known volatile class for the injection target, as it's the only reliable finder.
const EMPTY_BUTTON_SELECTOR = '[class*="toggleEmptyButton"]';
const SHUFFLE_BUTTON_ID = 'shuffle-assignees-btn';

// Selector for the main list container (ul) - using the STABLE selector for reliable list manipulation
const SLICER_LIST_CONTAINER_SELECTOR = 'ul[data-dividers="true"][data-variant="inset"]';

// Create a numeric seed from the browser's local calendar date.
function getCurrentDateSeed() {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let seed = 0;
    for (let i = 0; i < date.length; i++) {
        seed = (seed * 31 + date.charCodeAt(i)) >>> 0;
    }

    return seed;
}

// Mulberry32 gives us a deterministic pseudo-random number generator.
function createSeededRandom(seed) {
    return function() {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Function to shuffle an array (Fisher-Yates) using today's stable seed.
function shuffleArray(array) {
    const shuffled = [...array];
    const random = createSeededRandom(getCurrentDateSeed());

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- Button Injection Function (RE-FIXED LAYOUT) ---
function injectShuffleButton() {
    const emptyButton = document.querySelector(EMPTY_BUTTON_SELECTOR);
    const existingButton = document.getElementById(SHUFFLE_BUTTON_ID);

    if (emptyButton && !existingButton) {
        const parentContainer = emptyButton.parentElement;

        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.justifyContent = 'flex-start';
        wrapperDiv.style.alignItems = 'center';
        wrapperDiv.style.width = '100%';

        const shuffleButton = emptyButton.cloneNode(true);
        shuffleButton.id = SHUFFLE_BUTTON_ID;

        const textSpan = shuffleButton.querySelector('[data-component="text"]');
        if (textSpan) {
            textSpan.textContent = 'Together';
        }

        shuffleButton.removeAttribute('aria-describedby');
        shuffleButton.style.marginRight = '8px';
        shuffleButton.style.flexShrink = '0';
        shuffleButton.addEventListener('click', toggleColumnOrder);

        parentContainer.insertBefore(wrapperDiv, emptyButton);
        wrapperDiv.appendChild(emptyButton);
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
        targetColumns = originalColumns;
        newText = 'Together';
        isShuffled = false;
        console.log('Assignee list restored to original order. State: Together, but not scrambled.');
    } else {
        if (originalColumns.length === 0) {
            originalColumns = [...shufflableColumns];
        }
        targetColumns = shuffleArray(shufflableColumns);
        newText = 'Scrambled!';
        isShuffled = true;
        console.log('Assignee list shuffled successfully. State: Scrambled!');
    }

    columnContainer.innerHTML = '';

    targetColumns.forEach(column => {
        columnContainer.appendChild(column);
    });

    if (noAssigneesColumn) {
        columnContainer.appendChild(noAssigneesColumn);
    }

    buttonLabel.textContent = newText;
}

// --- MutationObserver Setup ---
const observer = new MutationObserver((mutations, obs) => {
    injectShuffleButton();
});

observer.observe(document.body, { childList: true, subtree: true });

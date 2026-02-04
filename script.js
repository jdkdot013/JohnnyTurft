const STORAGE_KEY = 'johnnyturft:tallyCounts:v1';
const GROUP_COUNT = 6;
const MAX_PER_GROUP = 5;

let groupCounts = new Array(GROUP_COUNT).fill(0);

function setAppHeight() {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}

setAppHeight();
window.addEventListener('resize', setAppHeight);

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length !== GROUP_COUNT) return;
        const normalized = parsed.map(n => {
            const value = Number(n);
            if (!Number.isFinite(value)) return 0;
            return Math.min(Math.max(value, 0), MAX_PER_GROUP);
        });
        groupCounts = normalized;
    } catch (_) {
        // Ignore storage errors; fall back to defaults.
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupCounts));
    } catch (_) {
        // Ignore storage errors.
    }
}

function updateTallyDisplay() {
    const tallyGroups = document.getElementById('tallyGroups');
    tallyGroups.innerHTML = '';

    let totalTallies = 0;
    const activeIndex = groupCounts.findIndex(count => count < MAX_PER_GROUP);

    groupCounts.forEach((count, index) => {
        totalTallies += count;
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('tallyGroup');
        if (index === activeIndex) {
            groupDiv.classList.add('tallyGroupActive');
            groupDiv.setAttribute('role', 'button');
            groupDiv.setAttribute('aria-label', 'Add tally');
            groupDiv.addEventListener('click', addTally);
        }
        
        const img = document.createElement('img');
        img.classList.add('tally');
        img.src = count === 0 ? 'images/tally-0.png' : `images/tally-${count}.png`;
        groupDiv.appendChild(img);

        tallyGroups.appendChild(groupDiv);
    });

    const overlay = document.getElementById('completeOverlay');
    if (groupCounts.every(count => count === MAX_PER_GROUP)) {
        overlay.classList.remove('hidden');
        overlay.removeAttribute('hidden');
        overlay.style.display = 'flex';
    } else {
        overlay.classList.add('hidden');
        overlay.setAttribute('hidden', '');
        overlay.style.display = 'none';
    }

    document.getElementById('moreButton').style.display = totalTallies > 0 ? "block" : "none";
    saveState();
}

function addTally() {
    const index = groupCounts.findIndex(count => count < MAX_PER_GROUP);
    if (index !== -1) {
        groupCounts[index]++;
        updateTallyDisplay();
    }
    document.getElementById('moreOptions').classList.add('hidden');
}

function resetTally() {
    groupCounts.fill(0);
    updateTallyDisplay();
}

function subtractTally() {
    for (let i = groupCounts.length - 1; i >= 0; i--) {
        if (groupCounts[i] > 0) {
            groupCounts[i]--;
            break;
        }
    }
    updateTallyDisplay();
}

function hideMoreOptions() {
    document.getElementById('moreOptions').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    loadState();
    updateTallyDisplay();

    document.getElementById('addTally').addEventListener('click', addTally);

    document.getElementById('moreButton').addEventListener('click', function() {
        var moreOptions = document.getElementById('moreOptions');
        if (moreOptions.classList.contains('hidden')) {
            moreOptions.classList.remove('hidden');
        } else {
            moreOptions.classList.add('hidden');
        }
    });

    document.getElementById('removeTally').addEventListener('click', function() {
        subtractTally();
        hideMoreOptions();
    });

    document.getElementById('resetTally').addEventListener('click', function() {
        resetTally();
        hideMoreOptions();
    });

    document.getElementById('overlayCloseButton').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        resetTally();
    });

    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }
});

document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
}, false);

window.addEventListener('pagehide', saveState);
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        saveState();
    }
});

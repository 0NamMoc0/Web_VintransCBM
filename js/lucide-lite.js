(function () {
    'use strict';

    const icons = {
        box: '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
        calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
        download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
        fish: '<path d="M6.5 12c2.5-4 6-6 10.5-6 2 0 3.5 1 4.5 2.5-1 1.5-2.5 2.5-4.5 2.5-4.5 0-8 2-10.5 6L3 12l3.5-5Z"/><path d="M16 9h.01"/><path d="M9 12c1.4 1.4 2.9 2.1 4.5 2.1"/>',
        'map-pin': '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
        package: '<path d="m16.5 9.4-9-5.2"/><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
        'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
        'trash-2': '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>'
    };

    const toSvg = (name) => {
        const body = icons[name];
        if (!body) return '';
        return `<svg class="lucide lucide-${name}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    };

    const createIcons = (root = document) => {
        root.querySelectorAll('i[data-lucide]').forEach((node) => {
            const svg = toSvg(node.getAttribute('data-lucide'));
            if (!svg) return;
            node.outerHTML = svg;
        });
    };

    window.lucide = { createIcons };
})();

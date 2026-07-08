// Post-processes the Expo web export (single-page output ignores app/+html.tsx).
// Injects PWA + mobile-browser meta tags so Safari/Chrome tint their chrome to
// match the dark app, content renders edge-to-edge on notched phones, and
// "Add to Home Screen" opens fullscreen standalone.
import { readFileSync, writeFileSync } from 'fs';

const file = new URL('../dist/index.html', import.meta.url);
let html = readFileSync(file, 'utf8');

if (!html.includes('theme-color')) {
    html = html.replace(
        /<meta name="viewport"[^>]*>/,
        '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />'
    );
    html = html.replace(
        '</title>',
        `</title>
    <meta name="theme-color" content="#000000" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="One'N'Move" />
    <meta name="description" content="Connecting drivers and vehicle owners across Jamaica" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <style>html, body { background: #000; }</style>`
    );
    writeFileSync(file, html);
    console.log('postbuild-web: injected PWA/theme meta tags into dist/index.html');
} else {
    console.log('postbuild-web: meta tags already present, skipping');
}

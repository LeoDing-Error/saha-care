/**
 * PWA Icon Generator for SAHA-Care
 *
 * Generates all required PWA icons with the "SC" branding
 * Uses the sharp library for image generation
 *
 * Run with: npm run generate:icons
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SAHA-Care theme color from vite.config.ts
const PRIMARY_COLOR = '#1976d2';
const TEXT_COLOR = '#ffffff';

interface IconConfig {
    name: string;
    size: number;
    isAppleIcon?: boolean;
}

const icons: IconConfig[] = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180, isAppleIcon: true },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
];

/**
 * Creates an SVG string for the icon
 */
function createSvg(size: number): string {
    const fontSize = Math.round(size * 0.4);
    const textY = size * 0.58; // Vertical center adjustment for text

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${PRIMARY_COLOR}" rx="${Math.round(size * 0.15)}"/>
    <text 
        x="50%" 
        y="${textY}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="${fontSize}px" 
        fill="${TEXT_COLOR}"
    >SC</text>
</svg>`.trim();
}

/**
 * Creates a maskable icon SVG with safe zone padding
 */
function createMaskableSvg(size: number): string {
    const padding = Math.round(size * 0.1); // 10% padding for safe zone
    const innerSize = size - padding * 2;
    const fontSize = Math.round(innerSize * 0.4);
    const textY = size * 0.58;

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${PRIMARY_COLOR}"/>
    <text 
        x="50%" 
        y="${textY}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="${fontSize}px" 
        fill="${TEXT_COLOR}"
    >SC</text>
</svg>`.trim();
}

/**
 * Creates a monochrome mask icon SVG for Safari
 */
function createMaskIconSvg(): string {
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="black" rx="77"/>
    <text 
        x="50%" 
        y="297" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="205px" 
        fill="white"
    >SC</text>
</svg>`.trim();
}

/**
 * Creates a simple ICO file (actually a PNG, browsers handle this fine)
 */
async function generateFavicon(publicDir: string): Promise<void> {
    const svg = createSvg(32);
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    // Generate multiple sizes for ICO
    const sizes = [16, 32, 48];
    const buffers: Buffer[] = [];

    for (const size of sizes) {
        const resizedSvg = createSvg(size);
        const buffer = await sharp(Buffer.from(resizedSvg)).png().toBuffer();
        buffers.push(buffer);
    }

    // For simplicity, we'll use the 32x32 PNG as favicon.ico
    // Modern browsers accept PNG favicons
    writeFileSync(join(publicDir, 'favicon.ico'), pngBuffer);
    console.log('Created: favicon.ico (32x32 PNG)');
}

async function generateIcons(): Promise<void> {
    const projectRoot = join(__dirname, '..');
    const publicDir = join(projectRoot, 'public');

    // Ensure public directory exists
    if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
    }

    console.log('Generating SAHA-Care PWA icons...\n');
    console.log(`Theme color: ${PRIMARY_COLOR}`);
    console.log(`Output directory: ${publicDir}\n`);

    // Generate PNG icons
    for (const icon of icons) {
        const svg = createSvg(icon.size);
        const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

        writeFileSync(join(publicDir, icon.name), pngBuffer);
        console.log(`Created: ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate favicon.ico
    await generateFavicon(publicDir);

    // Generate mask-icon.svg for Safari
    const maskIconSvg = createMaskIconSvg();
    writeFileSync(join(publicDir, 'mask-icon.svg'), maskIconSvg);
    console.log('Created: mask-icon.svg (Safari pinned tab)');

    console.log('\nAll PWA icons generated successfully!');
}

// Run the generator
generateIcons().catch((error) => {
    console.error('Error generating icons:', error);
    process.exit(1);
});

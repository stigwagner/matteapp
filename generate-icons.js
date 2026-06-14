import sharp from 'sharp';
import { writeFileSync } from 'fs';

// Funksjon for å lage SVG ikon med gange-tema
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${size * 0.6}"
        font-weight="bold" fill="white">×</text>
</svg>
`;

const sizes = [192, 512, 1024];

console.log('🎨 Genererer gangetabell-ikoner...\n');

for (const size of sizes) {
  const svgBuffer = Buffer.from(createIconSVG(size));

  await sharp(svgBuffer)
    .png()
    .toFile(`./public/icon-${size}.png`);

  console.log(`✅ icon-${size}.png generert`);
}

console.log('\n🎉 Alle ikoner generert!');

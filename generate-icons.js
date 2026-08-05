#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source
 * Requires: npm install --save-dev sharp
 * Usage: node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const SOURCE_SVG = path.join(PUBLIC_DIR, 'icon.svg');

// Define icon sizes
const iconSizes = [
  { size: 96, name: 'icon-96.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

// Maskable icon sizes (same sizes, different output)
const maskableSizes = [
  { size: 192, name: 'icon-maskable-192.png' },
  { size: 512, name: 'icon-maskable-512.png' },
];

async function generateIcons() {
  try {
    console.log('🎨 Generating PWA icons from SVG...\n');

    // Check if source SVG exists
    if (!fs.existsSync(SOURCE_SVG)) {
      console.error(`❌ Source SVG not found: ${SOURCE_SVG}`);
      console.error('Please create public/icon.svg first');
      process.exit(1);
    }

    // Generate standard icons
    for (const icon of iconSizes) {
      const outputPath = path.join(PUBLIC_DIR, icon.name);
      console.log(`  Generating ${icon.name} (${icon.size}x${icon.size})...`);

      await sharp(SOURCE_SVG)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0.0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`  ✅ Created ${icon.name}`);
    }

    // Generate maskable icons (with padding for safe areas)
    console.log('\n📌 Generating maskable icons...');
    for (const icon of maskableSizes) {
      const outputPath = path.join(PUBLIC_DIR, icon.name);
      const padding = Math.floor(icon.size * 0.2); // 20% padding
      const canvasSize = icon.size + padding * 2;

      console.log(`  Generating ${icon.name} (${icon.size}x${icon.size} with padding)...`);

      await sharp({
        create: {
          width: canvasSize,
          height: canvasSize,
          channels: 4,
          background: { r: 31, g: 41, b: 55, alpha: 1.0 }, // primary-800
        },
      })
        .composite([
          {
            input: await sharp(SOURCE_SVG)
              .resize(icon.size, icon.size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0.0 },
              })
              .png()
              .toBuffer(),
            top: padding,
            left: padding,
          },
        ])
        .png()
        .toFile(outputPath);

      console.log(`  ✅ Created ${icon.name}`);
    }

    console.log('\n✨ All icons generated successfully!\n');
    console.log('📝 Generated files:');
    console.log('   - icon-96.png');
    console.log('   - icon-192.png');
    console.log('   - icon-512.png');
    console.log('   - icon-maskable-192.png');
    console.log('   - icon-maskable-512.png');
    console.log('\n📋 Next steps:');
    console.log('   1. Check the files in public/ directory');
    console.log('   2. Test the PWA on iOS and Android');
    console.log('   3. Submit to app stores if needed');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  generateIcons();
} catch (e) {
  console.error('❌ sharp not found. Install it first:\n');
  console.error('   npm install --save-dev sharp\n');
  process.exit(1);
}

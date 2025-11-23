const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'app', 'globals.css');
const outputFile = path.join(__dirname, 'app', 'globals_new.css');

// Define ranges to skip (1-indexed, convert to 0-indexed)
const skipRanges = [
    [57, 61],      // Animation timing variables
    [421, 652],    // All animation classes and @keyframes
    [655, 659],    // *:focus-visible animation
    [662, 664],    // smooth scroll behavior
    [1031, 1152],  // 3D car card animations
    [1264, 1539],  // Glassmorphic animations
    [1629, 1710],  // Verified badge animations
    [1715, 1802],  // Featured ribbon animations
    [5413, 5584],  // Toast notification animations
    [5590, 5850],  // Loading screen animations
];

// Read file
const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

// Create set of lines to skip (convert to 0-indexed)
const skipLines = new Set();
skipRanges.forEach(([start, end]) => {
    for (let i = start - 1; i < end; i++) {
        skipLines.add(i);
    }
});

// Filter out skipped lines
const filteredLines = lines.filter((line, index) => !skipLines.has(index));

// Write output
fs.writeFileSync(outputFile, filteredLines.join('\n'), 'utf8');

console.log(`Removed ${skipLines.size} lines of animations`);
console.log(`Output written to ${outputFile}`);

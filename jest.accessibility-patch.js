// Patch for @testing-library/react-native accessibility.ts StyleSheet.flatten issue
const path = require('path');
const fs = require('fs');

// Find the accessibility.ts file
const accessibilityPath = path.join(__dirname, 'node_modules', '@testing-library', 'react-native', 'src', 'helpers', 'accessibility.ts');

if (fs.existsSync(accessibilityPath)) {
  const content = fs.readFileSync(accessibilityPath, 'utf8');
  
  // Check if it contains the problematic line
  if (content.includes('StyleSheet.flatten(style)')) {
    console.log('Patching accessibility.ts for StyleSheet.flatten issue...');
    
    // Replace the problematic line with a safe version
    const patchedContent = content.replace(
      'StyleSheet.flatten(style)',
      '(StyleSheet.flatten ? StyleSheet.flatten(style) : (Array.isArray(style) ? style.reduce((acc, val) => ({...acc, ...(val && typeof val === "object" ? val : {})}), {}) : (style && typeof style === "object" ? style : {})))'
    );
    
    fs.writeFileSync(accessibilityPath, patchedContent);
    console.log('Successfully patched accessibility.ts');
  }
}
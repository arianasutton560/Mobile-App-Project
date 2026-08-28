const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('provides an Expo root App component', () => {
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'App.js')), true);
});

test('uses only installed starter dependencies', () => {
  const appSource = fs.readFileSync(path.join(__dirname, '..', 'App.js'), 'utf8');

  assert.equal(appSource.includes("from 'expo-status-bar'"), false);
});

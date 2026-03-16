#!/usr/bin/env node

process.env.ESLINT_USE_FLAT_CONFIG = 'false';

const { spawnSync } = require('child_process');
const path = require('path');

const eslintPackageJsonPath = require.resolve('eslint/package.json');
const eslintPackageDir = path.dirname(eslintPackageJsonPath);
const eslintCliPath = path.join(eslintPackageDir, 'bin', 'eslint.js');

const result = spawnSync(
  process.execPath,
  [eslintCliPath, ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);

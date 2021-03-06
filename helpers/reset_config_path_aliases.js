const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')

const buildConfigPath = path.join(rootDir, 'config.yaml')
const BUILD_CONFIG = yaml.safeLoad(fs.readFileSync(buildConfigPath, 'utf8'))
const BUILD_PATHS = null

BUILD_CONFIG.dev.paths = BUILD_PATHS

const BUILD_CONFIG_YAML = yaml.safeDump(BUILD_CONFIG, { 'noRefs': true, 'indent': '4' });
fs.writeFileSync(buildConfigPath, BUILD_CONFIG_YAML, 'utf8');

console.log('Reset config build paths to NULL');
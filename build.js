// TODO(mike): On crash, popup.html should be changed with a meaningful error
// message, so there is some indication that the build failed.
//
// TODO(mike): Re-copy static files on change, so that changes to static files
// are reflected in the dist folder.
import 'dotenv/config.js'
import fs from 'fs'
import esbuild from 'esbuild'
import { exec, execSync } from 'child_process'
import manifest from './manifest.js'
import { watchFilesInDir } from './src/helpers/watch-files-in-dir.js'
import { sentryEsbuildPlugin } from '@sentry/esbuild-plugin'

// Define command line args
const watch = process.argv.includes('--watch')

const release = process.argv.includes('--release')
if (release) process.env.ENVIROMENT = 'production'

// Define env variables for build
const define = {}
for (const k in process.env) {
  if (k.startsWith('SECRET_')) continue

  define[`process.env.${k}`] = JSON.stringify(process.env[k])
}

// Clean dist folder so it's fresh
fs.rmSync('dist', { recursive: true, force: true })

// Copy static files to dist
fs.mkdirSync('dist/popup', { recursive: true })
fs.mkdirSync('dist/offscreen', { recursive: true })
execSync('cp -r src/assets dist/assets')
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2))

// Watch tailwindcss
exec(
  'npx tailwindcss -i ./src/assets/styles.css -o ./dist/assets/styles.css --watch',
  console.log
)

// Watch files
if (watch) {
  watchFilesInDir('.', handleChange)
}

// Initial build
const entryPoints = [
  'src/service-worker.js',
  'src/content-script.jsx',
  'src/popup.jsx',
  'src/offscreen.js'
]

await build('initial build')

if (release) {
  const releaseName = `wavenet-for-chrome-${process.env.npm_package_version}`
  execSync(`rm -f releases/${releaseName}.zip && zip -r releases/${releaseName}.zip releases`, console.log)
}

// ---------------------------------------------
function handleChange(filePath) {
  const isEntryPoint = entryPoints.includes(filePath)
  const isJsx = filePath.startsWith('src/') && filePath.endsWith('.jsx')

  if (isEntryPoint || isJsx) build(`${filePath} changed`)
}

async function build(reason) {
  const start = performance.now()
  let success = true

  const plugins = []
  if (process.env.SECRET_SENTRY_AUTH_TOKEN && !watch) {
    plugins.push(
      sentryEsbuildPlugin({
        org: 'wavenet-for-chrome',
        project: 'extension',
        authToken: process.env.SECRET_SENTRY_AUTH_TOKEN
      })
    )
  }

  try {
    const result = await esbuild.build({
      entryPoints,
      bundle: true,
      minify: true,
      sourcemap: true,
      outdir: 'dist',
      plugins,
      define
    })

    if (result.errors.length) {
      success = false
    }
  } catch (e) {
    success = false
  }

  const end = performance.now()
  console.log(`${success ? '⚡️' : '🚨'} Build ${success ? 'completed' : 'failed'} in ${Math.round(end - start)}ms (${reason})`)
}

import fs from 'fs'
import esbuild from 'esbuild'
import child_process from 'child_process'

// Force clean the dist folder and recreate it to ensure no stale files remain
fs.rmSync('dist', { recursive: true, force: true })
fs.mkdirSync('dist', { recursive: true })

// Copy the public folder to the dist folder
fs.cpSync('public', 'dist/public', { recursive: true })

// Copy the manifest.js file to the dist folder
const manifest = (await import('../manifest.js')).default
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2))

// Bundle the content script
const csContext = await esbuild.context({
  entryPoints: ['src/content-script.jsx'],
  bundle: true,
  outfile: 'dist/content-script.js',
  sourcemap: true,
})

csContext.rebuild()

// Bundle the service worker
const swContext = await esbuild.context({
  entryPoints: ['src/service-worker.js'],
  bundle: true,
  outfile: 'dist/service-worker.js',
  sourcemap: true,
})

swContext.rebuild()

// Bundle the offscreen page
const offscreenContext = await esbuild.context({
  entryPoints: ['src/offscreen.js'],
  bundle: true,
  outfile: 'dist/offscreen.js',
  sourcemap: true,
})

offscreenContext.rebuild()

// Bundle the popup page
const popupContext = await esbuild.context({
  entryPoints: ['src/popup.jsx'],
  bundle: true,
  outfile: 'dist/popup.js',
  sourcemap: true,
})

popupContext.rebuild()

// Bundle the changelog page
const changelogContext = await esbuild.context({
  entryPoints: ['src/changelog.jsx'],
  bundle: true,
  outfile: 'dist/changelog.js',
  sourcemap: true,
})

changelogContext.rebuild()

// Build the CSS
child_process.execSync('npx tailwindcss -i ./public/styles.css -o ./dist/public/styles.css')

// Create a ZIP file for the releases folder
const releaseName = `wavenet-for-chrome-${process.env.npm_package_version}`
child_process.execSync(`rm -f releases/${releaseName}.zip && zip -r releases/${releaseName}.zip dist`)
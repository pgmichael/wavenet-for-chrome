import fs from 'fs'
import esbuild from 'esbuild'
import child_process from 'child_process'

// Force clean the dist folder and recreate it to ensure no stale files remain
fs.rmSync('dist', { recursive: true, force: true })
fs.mkdirSync('dist', { recursive: true })

// Copy and watch the public folder to the dist folder
fs.cpSync('public', 'dist/public', { recursive: true })
fs.watch('public', {recursive: true}, () => {
  fs.cpSync('public', 'dist/public', { recursive: true })
})

// Copy and watch the manifest.js file to the dist folder
const manifest = (await import('../manifest.js')).default
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2))
fs.watch('manifest.js', {recursive: true}, async () => {
  const manifest = (await import(`../manifest.js?t=${Date.now()}`)).default
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2))
})

// Bundle the content script
const csContext = await esbuild.context({
  entryPoints: ['src/content-script.jsx'],
  bundle: true,
  outfile: 'dist/content-script.js',
  sourcemap: true,
})

csContext.watch()

// Bundle the service worker
const swContext = await esbuild.context({
  entryPoints: ['src/service-worker.js'],
  bundle: true,
  outfile: 'dist/service-worker.js',
  sourcemap: true,
})

swContext.watch()

// Bundle the offscreen page
const offscreenContext = await esbuild.context({
  entryPoints: ['src/offscreen.js'],
  bundle: true,
  outfile: 'dist/offscreen.js',
  sourcemap: true,
})

offscreenContext.watch()

// Bundle the popup page
const popupContext = await esbuild.context({
  entryPoints: ['src/popup.jsx'],
  bundle: true,
  outfile: 'dist/popup.js',
  sourcemap: true,
})

popupContext.watch()

// Bundle the changelog page
const changelogContext = await esbuild.context({
  entryPoints: ['src/changelog.jsx'],
  bundle: true,
  outfile: 'dist/changelog.js',
  sourcemap: true,
})

changelogContext.watch()

// Start the tailwind CLI in watch mode
child_process.exec(
  'npx tailwindcss -i ./public/styles.css -o ./dist/public/styles.css --watch',
  console.log
)
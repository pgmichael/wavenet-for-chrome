import { execSync } from 'child_process'
import { mkdirSync, rmSync, watch, writeFileSync } from 'fs'

// Get arguments from the command line
const args = process.argv.slice(2)
const environment = args[0].split('=')[1]
console.log(`🛠️  Building for ${environment} environment\n`)

// Setup environment variables for the frontend in development
const SHARED_ENVIRONMENT_VARIABLES = {
  TTS_API_URL: 'https://texttospeech.googleapis.com/v1beta1',
  GOOGLE_OAUTH2_CLIENT_ID:
    '89959520704-p0jas87qkq9u8tmjs0d0c6sopiajl0kl.apps.googleusercontent.com',
  GOOGLE_CHROME_EXTENSION_KEY:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv8jZ7956T275KyNvf6hU4JqqEb4e2sWrJXtZh2k2wR/3t36QLA+BmI3vCOxrdK8wlCmF1vs+I0NgzeYlIE27QEIjYen8s6wBM8jHAicGqSu/N9WFbJ1W3e2I5t4RmMpZXw4YtDplof6Niy7mcFoCwKuUKxkH14WjOLSn+eQSsV2QoFePua0qGypmxCsoZ0nJleshRPd/5y52/xJTTlQ3USgQZuwc37nTzxEI34XXlV/N3lrJtJFJ6uLFqgU8FNFBozsrmTcrVnieLBSsMpqG8+EpKbeJoEK02xr6N4YOhXBFqSQ6jXJ5+E7PQNJmenOwa8w2VSIMVXtnOG0XFPfQtwIDAQAB',
}

const PRODUCTION_ENVIRONMENT_VARIABLES = {
  ENVIRONMENT: 'production',
  BACKEND_URL: 'https://api.wavenet-for-chrome.com/v1',
}

const DEVELOPMENT_ENVIRONMENT_VARIABLES = {
  ENVIRONMENT: 'development',
  BACKEND_URL: 'http://localhost:4000/v1',
}

const ENVIRONMENT_VARIABLES =
  environment === 'production'
    ? { ...SHARED_ENVIRONMENT_VARIABLES, ...PRODUCTION_ENVIRONMENT_VARIABLES }
    : { ...SHARED_ENVIRONMENT_VARIABLES, ...DEVELOPMENT_ENVIRONMENT_VARIABLES }

const define = Object.entries(ENVIRONMENT_VARIABLES).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value),
  }),
  {},
)

process.env = { ...process.env, ...ENVIRONMENT_VARIABLES }

// Force clean the dist folder and recreate it to ensure no stale files remain
rmSync('dist', { recursive: true, force: true })
mkdirSync('dist', { recursive: true })

// If we're in development, watch the src folder for changes and rebuild
if (environment === 'development') {
  build()
  watch('src', { recursive: true }, build)
}

// If we're in production, build the extension and zip it up in the releases folder
if (environment === 'production') {
  const releaseName = `wavenet-for-chrome-${process.env.npm_package_version}`
  await build()

  console.time(`✅ Zipped up release ${releaseName}`)
  execSync(
    `rm -f releases/${releaseName}.zip && zip -r releases/${releaseName}.zip dist`,
  )
  console.timeEnd(`✅ Zipped up release ${releaseName}`)
}

// functions --------------------------------------------------------------
async function build() {
  console.time('✅ Built extension\n')

  const output = await Bun.build({
    entrypoints: [
      'src/extension/extension.tsx',
      'src/extension/popup.tsx',
      'src/extension/content-script.tsx',
      'src/extension/service-worker.ts',
      'src/extension/offscreen.ts',
    ],
    define,
    outdir: 'dist',
  })

  if (!output.success) {
    console.error(output)
  }

  console.time('ℹ️ Copied public folder')
  execSync('cp -r src/extension/public dist')
  console.timeEnd('ℹ️ Copied public folder')

  console.time('ℹ️ Built manifest')
  const manifest = (await import('./src/extension/manifest')).default
  writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2))
  console.timeEnd('ℹ️ Built manifest')

  console.time('ℹ️ Built css')
  execSync(
    'npx tailwindcss -i ./src/extension/public/styles.css -o ./dist/public/styles.css',
  )
  console.timeEnd('ℹ️ Built css')
  console.timeEnd('✅ Built extension')

  if (environment === 'development') console.log('')
}

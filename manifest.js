export default {
  name: 'Wavenet for Chrome',
  version: '8',
  manifest_version: 3,
  permissions: [
    'contextMenus',
    'downloads',
    'storage',
    'activeTab',
    'scripting',
    'offscreen'
  ],
  commands: {
    readAloudShortcut: {
      suggested_key: {
        default: 'Ctrl+Shift+S',
        mac: 'Command+Shift+S'
      },
      description: 'Read aloud'
    },
    downloadShortcut: {
      suggested_key: {
        default: 'Ctrl+Shift+E',
        mac: 'Command+Shift+E'
      },
      description: 'Download'
    }
  },
  background: {
    service_worker: 'service-worker.js',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content-script.js']
    }
  ],
  action: {
    default_title: 'Wavenet for Chrome',
    default_popup: 'assets/popup.html',
    default_icon: 'assets/icons/icon_1000.png'
  },
  icons: {
    16: 'assets/icons/icon_16.png',
    19: 'assets/icons/icon_19.png',
    38: 'assets/icons/icon_38.png',
    48: 'assets/icons/icon_48.png',
    128: 'assets/icons/icon_128.png',
    1000: 'assets/icons/icon_1000.png'
  },
  homepage_url: 'https://github.com/pgmichael/wavenet-for-chrome'
}

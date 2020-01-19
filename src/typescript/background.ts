import WaveNet from "./wavenet"
const wavenet = new WaveNet()

chrome.commands.getAll((commands) => {
  const startCommand = commands.find((element) => element.name === "speak")
  chrome.contextMenus.create({
    id: 'start',
    title: `Start Speaking (${startCommand.shortcut})`,
    contexts: ['selection'],
    onclick: info => wavenet.start(info.selectionText)
  })

  chrome.contextMenus.create({
    id: 'stop',
    title: 'Stop Speaking',
    contexts: ['selection'],
    onclick: _ => wavenet.stop(),
    enabled: false
  })

  chrome.contextMenus.create({
    id: 'download',
    title: 'Download as MP3',
    contexts: ['selection'],
    onclick: info => wavenet.download(info.selectionText)
  })

  chrome.commands.onCommand.addListener((command) => {
    if (command === "speak")
      chrome.tabs.executeScript(
        { code: "window.getSelection().toString();" },
        (selection) => wavenet.start(selection[0])
      )
  })
})
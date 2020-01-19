import WaveNet from "./wavenet"
const wavenet = new WaveNet()

chrome.commands.getAll((commands) => {
  const startCommand = commands.find((element) => element.name === "speak")
  const downloadCommand = commands.find((element) => element.name === "download")

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
    title: `Download as MP3 (${downloadCommand.shortcut})`,
    contexts: ['selection'],
    onclick: info => wavenet.download(info.selectionText)
  })

  chrome.commands.onCommand.addListener((command) => {
    switch (command) {
      case "speak":
        chrome.tabs.executeScript(
          { code: convertSelection },
          (selection) => wavenet.start(selection[0])
        )
        break;
      case "download":
        chrome.tabs.executeScript(
          { code: convertSelection },
          (selection) => wavenet.download(selection[0])
        )
        break;
    }
  })
})

// Get the selected text and adds imgs alt tags into text
// TODO: Could something like this be possible for the context menu callbacks?
const convertSelection = `
    var selectionContents = window.getSelection().getRangeAt(0).cloneContents();
		var imgs = selectionContents.querySelectorAll('img');
		for(const img of imgs) {
			var altText = document.createTextNode(img.alt);
			img.parentNode.replaceChild(altText, img);
		}
		selectionContents.textContent;
`
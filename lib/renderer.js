// TODO: you will implement this!
const electron = require('electron')
const ipc = electron.ipcRenderer
const $ = require('jquery')
const $markdownView = $('.raw-markdown')
const $htmlView = $('.rendered-html')
const $openFileButton = $('#open-file')
const $saveFileButton = $('#save-file')
const $copyHtmlButton = $('#copy-html')
const marked = require('marked')
const remote = electron.remote
const mainProcess = remote.require('./main')
const clipboard = remote.clipboard
const shell = electron.shell
const $showInFileSystemButton = $('#show-in-file-system')
const $openInDefaultEditorButton = $('#open-in-default-editor')
const $command = $('#command')
const $output = $('.output')
const $outputerror = $('.outputerror')
const dragDrop = require('drag-drop')


let currentFile = null
$markdownView.on('keyup', (event) => {
  const content = $(event.target).val()
  renderMarkdownToHtml(content)
})

ipc.on('file-opened', (event, file, content) => {
  currentFile = file

  $showInFileSystemButton.attr('disabled', false)
  $openInDefaultEditorButton.attr('disabled', false)

  $markdownView.val(content)
  renderMarkdownToHtml(content)
})

$showInFileSystemButton.on('click', () => {
  shell.showItemInFolder(currentFile)
})

$openInDefaultEditorButton.on('click', () => {
  shell.openItem(currentFile)
})

function renderMarkdownToHtml (markdown) {
  const html = marked(markdown)
  $htmlView.html(html)

}

$openFileButton.on('click', () => {
  mainProcess.openFile()
})

$saveFileButton.on('click', () => {
  mainProcess.saveFile($htmlView.html());
})

$copyHtmlButton.on('click', () => {
  const html = $htmlView.html()
  clipboard.writeText(html)
})

dragDrop('.raw-markdown', function (files, pos) {
  var content = $markdownView.val();
  content = '![Alt text]('+files[0].path+' "Optional title") \n' + content;
  $markdownView.val(content);
  renderMarkdownToHtml(content)
})

$(document).on('click', 'a[href^="http"]', (event) => {
  event.preventDefault()
  shell.openExternal(event.target.href)
})

$command.on('keyup', (e) => {
    if(e.which == 13) {
        mainProcess.execCmd($command.val());
        $command.val('')
    }
});

ipc.on('cmd-out', (event, txt) => {
  $output.html(txt.replace(/\n/g, "<br />"));
})

ipc.on('cmd-err', (event, txt) => {
  $outputerror.html(txt.replace(/\n/g, "<br />"));
})

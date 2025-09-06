let currentTabId = null;
let tabs = {};

function getEditorContent() {
  return window.codeEditor.getValue();
}

function setEditorContent(content) {
  window.codeEditor.setValue(content || '');
}

function changeLanguage(lang) {
  let mode;
  switch(lang) {
    case 'python': mode = 'python'; break;
    case 'html': mode = 'htmlmixed'; break;
    case 'cpp': 
    case 'java': mode = 'clike'; break;
    default: mode = 'javascript';
  }
  window.codeEditor.setOption('mode', mode);
}

function updateEditorTheme(isDark) {
  window.codeEditor.setOption('theme', isDark ? 'dracula' : 'default');
}

function updateFont(font) {
  document.querySelector('.CodeMirror').style.fontFamily = font;
}

function updateBG(color) {
  document.querySelector('.CodeMirror').style.backgroundColor = color;
}

function newTab(name = "Untitled", content = "") {
  const id = 'tab-' + Date.now();
  tabs[id] = { content, name };
  addTabToUI(id, name);
  switchTab(id);
}

function addTabToUI(id, name) {
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.textContent = name;
  tab.dataset.id = id;
  tab.onclick = () => switchTab(id);
  document.getElementById('tabs').appendChild(tab);
}

function switchTab(id) {
  currentTabId = id;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[data-id="${id}"]`).classList.add('active');
  setEditorContent(tabs[id].content);
  
  const fileName = tabs[id].name.toLowerCase();
  if (fileName.endsWith('.py')) changeLanguage('python');
  else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) changeLanguage('html');
  else if (fileName.endsWith('.cpp') || fileName.endsWith('.c++') || fileName.endsWith('.cc')) changeLanguage('cpp');
  else if (fileName.endsWith('.java')) changeLanguage('java');
  else changeLanguage('javascript');
}

function openFile() {
  const fileInput = document.getElementById('file-input');
  fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      newTab(file.name, reader.result);
      if (file.name.endsWith('.md')) togglePreview();
    };
    reader.readAsText(file);
  };
}

function saveFile() {
  const text = getEditorContent();
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = tabs[currentTabId]?.name || 'maybe.txt';
  link.href = URL.createObjectURL(blob);
  link.click();
}

async function runPython() {
  if (!window.pythonAPI) {
    console.error('Python API not available!');
    document.getElementById('console-output').textContent = 'Error: Python functionality not loaded';
    return;
  }

  const code = getEditorContent();
  try {
    const output = await window.pythonAPI.run(code);
    document.getElementById('console-output').textContent = output || "Python executed successfully (no output)";
  } catch (error) {
    document.getElementById('console-output').textContent = `Error: ${error}`;
  }
}

function runHTML() {
  const html = getEditorContent();
  const iframe = document.createElement('iframe');
  iframe.srcdoc = html;
  iframe.style.width = '100%';
  iframe.style.height = '300px';
  document.getElementById('preview').innerHTML = '';
  document.getElementById('preview').appendChild(iframe);
  document.getElementById('preview').style.display = 'block';
}

function togglePreview() {
  const preview = document.getElementById('preview');
  const text = getEditorContent();
  preview.innerHTML = marked.parse(text);
  preview.style.display = preview.style.display === 'none' ? 'block' : 'none';
}

function toggleTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('light-theme', !isDark);
  updateEditorTheme(isDark);
}

function loadExtension(name) {
  if (name === 'hello') {
    alert('Hello from MaybeCode Extension!');
  }
}

newTab();
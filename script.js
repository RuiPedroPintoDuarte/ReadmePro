const editor         = document.getElementById('editor');
const preview        = document.getElementById('preview');
const fileInput      = document.getElementById('fileInput');
const uploadBtn      = document.getElementById('uploadBtn');
const uploadStatus   = document.getElementById('uploadStatus');
const uploadFileName = document.getElementById('uploadFileName');
const clearBtn       = document.getElementById('clearBtn');
const downloadBtn    = document.getElementById('downloadBtn');
const templateBtns   = document.querySelectorAll('.template-btn');
const aiOverlay      = document.getElementById('aiOverlay');
const aiStepText     = document.getElementById('aiStepText');
const aiProgressBar  = document.getElementById('aiProgressBar');
const wordCount      = document.getElementById('wordCount');
const lineCount      = document.getElementById('lineCount');
const previewScroll  = document.querySelector('.preview-scroll');
const pasteInput     = document.getElementById('pasteInput');

let projectData = {
    name:        'My Project',
    description: 'A short description of what this project does.',
    install:     'npm install',
    usage:       "const app = require('./index');\napp.init();",
    features:    ['Feature One', 'Feature Two', 'Feature Three'],
    endpoints:   ['GET /v1/status', 'POST /v1/resource'],
    tech:        ['JavaScript', 'Node.js'],
    license:     'MIT'
};

const TEMPLATES = {

    minimal: (d) => `# ${d.name}

${d.description}

## Installation

\`\`\`bash
${d.install}
\`\`\`

## Usage

\`\`\`javascript
${d.usage}
\`\`\`

## License

${d.license} — See [LICENSE](LICENSE) for details.
`,

    pro: (d) => `# ${d.name}

<p align="left">
  <img src="https://img.shields.io/badge/version-1.0.0-6366f1?style=flat-square" alt="version" />
  <img src="https://img.shields.io/badge/license-${encodeURIComponent(d.license)}-22d3ee?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/build-passing-4ade80?style=flat-square" alt="build" />
</p>

> ${d.description}

## Features

${d.features.map(f => `- ${f}`).join('\n')}

## Installation

\`\`\`bash
${d.install}
\`\`\`

## Usage

\`\`\`javascript
${d.usage}
\`\`\`

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

${d.license} © ${new Date().getFullYear()}
`,

    frontend: (d) => `# ${d.name}

${d.description}

## Tech Stack

${d.tech.map(t => `- ${t}`).join('\n')}

## Getting Started

**Prerequisites:** Node.js 18+, npm or yarn

\`\`\`bash
git clone https://github.com/user/${slugify(d.name)}.git
cd ${slugify(d.name)}

${d.install}

npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/
├── pages/
├── styles/
└── utils/
\`\`\`

## License

${d.license}
`,

    python: (d) => `# ${d.name}

${d.description}

## Requirements

- Python 3.8 or higher
${d.tech.filter(t => t.toLowerCase() !== 'python').map(t => `- ${t}`).join('\n')}

## Installation

\`\`\`bash
pip install ${slugify(d.name, '_')}
\`\`\`

Or from source:

\`\`\`bash
git clone https://github.com/user/${slugify(d.name)}.git
cd ${slugify(d.name)}
pip install -r requirements.txt
\`\`\`

## Usage

\`\`\`python
from ${slugify(d.name, '_')} import main

result = main.run()
print(result)
\`\`\`

## Testing

\`\`\`bash
pytest tests/
\`\`\`

## License

${d.license}
`,

    api: (d) => `# ${d.name} — API Reference

${d.description}

## Base URL

\`\`\`
https://api.yourdomain.com/v1
\`\`\`

## Authentication

All requests must include a Bearer token in the Authorization header:

\`\`\`http
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

## Endpoints

${d.endpoints.map(e => {
    const [method, path] = e.split(' ');
    return `### ${method} \`${path || '/'}\`\n\nDescription of this endpoint.\n\n**Response** \`200 OK\`\n\n\`\`\`json\n{ "status": "ok" }\n\`\`\``;
}).join('\n\n')}

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## License

${d.license}
`

};

function slugify(str, sep = '-') {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, sep)
        .replace(new RegExp(`^${sep}|${sep}$`, 'g'), '');
}

function cleanText(str) {
    return str.replace(/^[\u{1F300}-\u{1FFFF}]\s*/u, '').trim();
}

function renderMarkdown() {
    preview.innerHTML = marked.parse(editor.value);
    updateStats(editor.value);
}

function updateStats(raw) {
    const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    const lines = raw.split('\n').length;
    wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    lineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
}

editor.addEventListener('input', renderMarkdown);

const DEFAULT_DATA = {
    name:        'My Project',
    description: 'A short description of what this project does.',
    install:     'npm install',
    usage:       "const app = require('./index');\napp.init();",
    features:    ['Feature One', 'Feature Two', 'Feature Three'],
    endpoints:   ['GET /v1/status', 'POST /v1/resource'],
    tech:        ['JavaScript', 'Node.js'],
    license:     'MIT'
};

function resetData() {
    projectData = {
        ...DEFAULT_DATA,
        features:  [...DEFAULT_DATA.features],
        tech:      [...DEFAULT_DATA.tech],
        endpoints: [...DEFAULT_DATA.endpoints]
    };
}

function parseRawToData(raw) {
    if (!raw || raw.length < 5) return;
    resetData();

    const mdTitle    = raw.match(/^#\s+(.+)$/m);
    const labelTitle = raw.match(/^(?:project|name|title)\s*[:\-]\s*(.+)$/im);
    const firstLine  = raw.split('\n').map(l => l.trim()).find(l => l && l.length < 80 && !l.startsWith('-') && !l.startsWith('*'));

    if (mdTitle)         projectData.name = cleanText(mdTitle[1]);
    else if (labelTitle) projectData.name = cleanText(labelTitle[1]);
    else if (firstLine)  projectData.name = cleanText(firstLine);

    const mdDesc       = raw.match(/^#{1,3}\s+[^\n]+\n+([^#\-\*\n][^\n]{15,})/m);
    const labelDesc    = raw.match(/^description\s*[:\-]\s*(.+)$/im);
    const lines        = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const sentenceDesc = lines.slice(1).find(l =>
        l.length > 20 &&
        !l.startsWith('-') && !l.startsWith('*') &&
        !l.startsWith('`') && !l.startsWith('#') &&
        !/^(?:install|usage|feature|test|license|project|name)\s*[:\-]/i.test(l) &&
        !/^(?:pip|npm|yarn|git|pytest|npx)/i.test(l)
    );

    if (mdDesc)            projectData.description = mdDesc[1].trim();
    else if (labelDesc)    projectData.description = labelDesc[1].trim();
    else if (sentenceDesc) projectData.description = sentenceDesc;

    const bullets = [...raw.matchAll(/^[ \t]*[-*]\s+(.+)$/gm)]
        .map(m => cleanText(m[1])).filter(Boolean).slice(0, 8);
    if (bullets.length > 0) projectData.features = bullets;

    const fenceInstall = raw.match(/```(?:bash|sh|shell|zsh)?\n([\s\S]*?(?:install|pip|yarn add)[\s\S]*?)```/im);
    const bareInstall  = raw.match(/^[ \t]*((?:pip install|npm install|npm i|yarn add|npx)\s+\S[^\n]*)/im);
    const labelInstall = raw.match(/^install\s*[:\-]\s*(.+)$/im);

    if (fenceInstall)      projectData.install = fenceInstall[1].trim();
    else if (bareInstall)  projectData.install = bareInstall[1].trim();
    else if (labelInstall) projectData.install = labelInstall[1].trim();

    const fenceUsage = raw.match(/```(?:js|javascript|ts|typescript|python|py)\n([\s\S]+?)```/im);
    const labelUsage = raw.match(/^usage\s*[:\-]\s*\n([\s\S]+?)(?:\n\n|\n[A-Z]|$)/im);

    if (fenceUsage)      projectData.usage = fenceUsage[1].trim();
    else if (labelUsage) projectData.usage = labelUsage[1].trim();

    const epMatches = [...raw.matchAll(/\b(GET|POST|PUT|DELETE|PATCH)\s+(`?)(\S+)\2/gi)];
    if (epMatches.length > 0) {
        projectData.endpoints = [...new Set(epMatches.map(m => `${m[1].toUpperCase()} ${m[3]}`))].slice(0, 8);
    }

    const known = ['react','next.js','vue','svelte','tailwind','bootstrap','express',
                   'node.js','python','flask','django','fastapi','mongodb','postgresql',
                   'typescript','graphql','docker','redis','aws'];
    const found = known.filter(k => raw.toLowerCase().includes(k));
    if (found.length > 0) projectData.tech = found.map(k => k.charAt(0).toUpperCase() + k.slice(1));

    const licenseMatch = raw.match(/\b(MIT|Apache[\s\-]2(?:\.0)?|GPL(?:[\s\-]v?[23])?|BSD(?:[\s\-]\d)?)\b/i);
    if (licenseMatch) projectData.license = licenseMatch[0].toUpperCase().replace(/\s+/g, ' ').trim();
}

const AI_STEPS = [
    'Parsing document structure...',
    'Extracting sections & metadata...',
    'Mapping content to template...',
    'Applying formatting rules...',
    'Finalizing output...'
];

function showAI() { aiOverlay.classList.remove('hidden'); }
function hideAI() { aiOverlay.classList.add('hidden'); aiProgressBar.style.width = '0%'; }

function runAIRestructure(templateKey, btn) {
    showAI();
    btn.classList.add('processing');
    let step = 0;

    function nextStep() {
        if (step >= AI_STEPS.length) {
            parseRawToData(editor.value);
            editor.value = TEMPLATES[templateKey](projectData);
            renderMarkdown();
            setTimeout(() => {
                hideAI();
                btn.classList.remove('processing');
                templateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }, 300);
            return;
        }
        aiStepText.textContent = AI_STEPS[step];
        aiProgressBar.style.width = `${((step + 1) / AI_STEPS.length) * 100}%`;
        step++;
        setTimeout(nextStep, 750);
    }

    setTimeout(nextStep, 200);
}

templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('processing')) return;
        runAIRestructure(btn.dataset.template, btn);
    });
});

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const content = ev.target.result;
        editor.value = content;
        renderMarkdown();
        parseRawToData(content);
        uploadFileName.textContent = `✓ ${file.name}`;
        uploadStatus.classList.remove('hidden');
    };
    reader.readAsText(file);
    fileInput.value = '';
});

clearBtn.addEventListener('click', () => {
    editor.value = '';
    renderMarkdown();
    uploadStatus.classList.add('hidden');
    pasteInput.value = '';
    templateBtns.forEach(b => b.classList.remove('active'));
});

pasteInput.addEventListener('input', () => {
    editor.value = pasteInput.value;
    renderMarkdown();
});

let syncingEditor = false;
let syncingPreview = false;

editor.addEventListener('scroll', () => {
    if (syncingEditor || syncingPreview) return;
    syncingEditor = true;
    const pct = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    previewScroll.scrollTop = pct * (previewScroll.scrollHeight - previewScroll.clientHeight);
    setTimeout(() => (syncingEditor = false), 60);
});

previewScroll.addEventListener('scroll', () => {
    if (syncingPreview || syncingEditor) return;
    syncingPreview = true;
    const pct = previewScroll.scrollTop / (previewScroll.scrollHeight - previewScroll.clientHeight);
    editor.scrollTop = pct * (editor.scrollHeight - editor.clientHeight);
    setTimeout(() => (syncingPreview = false), 60);
});

function downloadReadme() {
    const blob = new Blob([editor.value], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'README.md' });
    a.click();
    URL.revokeObjectURL(url);
}

downloadBtn.addEventListener('click', downloadReadme);

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadReadme();
    }
});

editor.value = TEMPLATES.minimal(projectData);
renderMarkdown();

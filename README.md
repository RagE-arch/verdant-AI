# Verdant AI 🌿

An offline-first nature companion made with HTML, CSS, and JavaScript. Its AI nature guide uses **Qwen2.5 1.5B Instruct** through **Ollama**, running on your own computer. There is no hosted AI API key and the app's chat proxy only talks to Ollama on localhost.

## What is included

- Responsive dashboard and navigation
- Local-model nature guide with quick prompts
- Seven screen-free field missions
- Field journal saved in browser `localStorage`, with one-click JSON export
- Activity counters based on saved field notes and completed missions
- Service worker that caches the app shell after the first visit
- A local Node.js server that serves the app and proxies chat requests to Ollama

## Requirements

- Node.js 20 or newer: https://nodejs.org/en/download/
- Ollama: https://ollama.com/download
- Enough disk space and memory for the model. `qwen2.5:1.5b` is a relatively small model by LLM standards, but its download and runtime memory needs are still significant for some computers.

## Run it on Windows

1. Install Node.js LTS and Ollama.
2. Open **Command Prompt** or **PowerShell**.
3. Change directory to the folder containing this project, for example:

   ```powershell
   cd "$HOME\Downloads\verdant-ai"
   ```

   If you extracted it somewhere else, use that folder's path.

4. Download the model once:

   ```powershell
   ollama pull qwen2.5:1.5b
   ```

5. Start Ollama if it is not already running. On Windows, the Ollama desktop app normally runs in the background. You can check with:

   ```powershell
   ollama list
   ```

6. Start Verdant AI in the project folder:

   ```powershell
   npm start
   ```

7. Open **http://127.0.0.1:3000** in your browser. Keep the terminal and Ollama running while you use the local AI guide.

If you prefer, test the model in the terminal first with `ollama run qwen2.5:1.5b` and ask it a simple question. Type `/bye` to exit that chat.

## Test checklist

- [ ] Visit `http://127.0.0.1:3000`; the dashboard should render.
- [ ] The status at the top should eventually say **Local AI ready**.
- [ ] Open Nature guide and ask: “Why do leaves have different shapes?” A reply should come from the local model.
- [ ] Open Field missions, start a mission, and save a field note.
- [ ] Refresh the page; the journal note and counters should remain.
- [ ] Open DevTools → Application → Service Workers and confirm the service worker is active.
- [ ] After the first page load and model download, disconnect from the internet while keeping the app server and Ollama running. Reload the page and ask a question. This tests local inference; the app shell alone does not mean the AI model is cached by the browser.

## Field journal export

Use **Export journal** in the Field Journal view to save your notes and completed mission IDs as a local JSON file. The export is created in your browser and is not uploaded anywhere.

## Offline and privacy: the honest version

- **First setup needs internet** to download Node.js/Ollama (if not installed), the model, and any initial app resources.
- **After setup**, the Node server, Ollama, and downloaded model can generate responses without an internet connection. You must keep both local processes available.
- The service worker caches the app shell, but does not cache the model; Ollama manages its own local model files.
- Journal entries and mission progress are stored in the browser on this device. Clearing browser site data can erase them. They are not synced or backed up.
- The app sends questions to `http://127.0.0.1:3000/api/chat`, and the local server forwards them to Ollama at `http://127.0.0.1:11434`. The project contains no cloud AI endpoint. Do not expose the local server to a public network without adding appropriate security.
- The UI uses system font fallbacks and does not need a remote font service.
- This prototype has not been tested on every device or browser. Offline behaviour should be verified using the checklist above.

## Open model and licensing

The selected model is **Qwen/Qwen2.5-1.5B-Instruct**, distributed under the Apache 2.0 license according to its model card. Read the exact model card and license before redistribution or commercial use:

- Model card: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- License: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Ollama API docs: https://github.com/ollama/ollama/blob/main/docs/api.md

“Open-weight” is the precise term for the model weights. The app code is provided separately under the MIT License below. Model and app licenses are distinct.

## Configuration

Default settings are `PORT=3000`, `OLLAMA_URL=http://127.0.0.1:11434`, and `OLLAMA_MODEL=qwen2.5:1.5b`.

PowerShell example to select a different already-pulled Ollama model:

```powershell
$env:OLLAMA_MODEL="qwen2.5:1.5b"
npm start
```

The model name must match a model listed by `ollama list`. The app uses only the model configured for the local server.

## Limitations and safe use

- The AI can be wrong, outdated, or overconfident. Treat nature answers as educational suggestions, not authoritative species identification or medical advice.
- Do not taste unknown plants or fungi, handle unfamiliar wildlife, disturb nests, or enter unsafe areas for a mission.
- Mission completion and time totals are local self-reported logs, not independently verified activity measurements.
- No location tracking, microphone recording, or camera access is implemented.

## App code license

MIT License

Copyright (c) 2026 Verdant AI contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

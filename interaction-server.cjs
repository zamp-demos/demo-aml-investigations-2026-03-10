// interaction-server.cjs — AML Investigations Demo Server
try { require('dotenv').config(); } catch(e) {}

// Prevent silent crashes — log errors so Railway shows them
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');
const PROCESSES_PATH = path.join(DATA_DIR, 'processes.json');
const BASE_PROCESSES_PATH = path.join(DATA_DIR, 'base_processes.json');
const SIGNALS_PATH = path.join(__dirname, 'interaction-signals.json');
const FEEDBACK_QUEUE_PATH = path.join(__dirname, 'feedbackQueue.json');
const KB_PATH = path.join(DATA_DIR, 'knowledgeBase.md');
const KB_VERSIONS_PATH = path.join(DATA_DIR, 'kbVersions.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.VITE_MODEL || 'gemini-2.5-flash';

let state = { sent: false, confirmed: false, signals: {} };
const runningProcesses = new Map();

// --- Initialization ---
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
if (!fs.existsSync(PROCESSES_PATH) && fs.existsSync(BASE_PROCESSES_PATH)) {
    fs.copyFileSync(BASE_PROCESSES_PATH, PROCESSES_PATH);
}
if (!fs.existsSync(SIGNALS_PATH)) {
    fs.writeFileSync(SIGNALS_PATH, JSON.stringify({
        APPROVE_SAR_002: false, DECLINE_SAR_002: false,
        APPROVE_SAR_003: false, DECLINE_SAR_003: false,
        OPTION_A_004: false, OPTION_B_004: false, OPTION_C_004: false
    }, null, 4));
}
if (!fs.existsSync(FEEDBACK_QUEUE_PATH)) fs.writeFileSync(FEEDBACK_QUEUE_PATH, '[]');
if (!fs.existsSync(KB_VERSIONS_PATH)) fs.writeFileSync(KB_VERSIONS_PATH, '[]');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

const MIME_TYPES = {
    '.html': 'text/html', '.js': 'application/javascript', '.jsx': 'application/javascript',
    '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.ttf': 'font/ttf', '.md': 'text/markdown', '.pdf': 'application/pdf',
    '.webm': 'video/webm', '.mp4': 'video/mp4'
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { resolve({}); } });
        req.on('error', reject);
    });
}

function jsonResponse(res, data, status = 200) {
    res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

async function callGemini(contents, systemInstruction) {
    if (!GEMINI_API_KEY) return 'Gemini API key not configured.';
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction });
        const result = await model.generateContent({ contents });
        return result.response.text();
    } catch(e) { console.error('Gemini error:', e); return 'Error calling Gemini API.'; }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const cleanPath = parsedUrl.pathname;

    // Health check endpoint for Railway
    if (cleanPath === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    }

    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        return res.end();
    }

    // --- RESET ---
    if (cleanPath === '/reset') {
        state = { sent: false, confirmed: false, signals: {} };
        console.log('Demo Reset Triggered');
        fs.writeFileSync(SIGNALS_PATH, JSON.stringify({
            APPROVE_SAR_002: false, DECLINE_SAR_002: false,
            APPROVE_SAR_003: false, DECLINE_SAR_003: false,
            OPTION_A_004: false, OPTION_B_004: false, OPTION_C_004: false
        }, null, 4));
        runningProcesses.forEach((proc) => { try { process.kill(-proc.pid, 'SIGKILL'); } catch(e) {} });
        runningProcesses.clear();
        exec('pkill -9 -f "node(.*)simulation_scripts" || true', () => {
            setTimeout(() => {
                if (fs.existsSync(BASE_PROCESSES_PATH)) fs.copyFileSync(BASE_PROCESSES_PATH, PROCESSES_PATH);
                ['AML_001','AML_002','AML_003','AML_004'].forEach(id => {
                    fs.writeFileSync(path.join(DATA_DIR, `process_${id}.json`), JSON.stringify({ logs: [], keyDetails: {}, sidebarArtifacts: [] }, null, 4));
                });
                fs.writeFileSync(FEEDBACK_QUEUE_PATH, '[]');
                fs.writeFileSync(KB_VERSIONS_PATH, '[]');
                const scripts = [
                    { file: 'aml_story_1_cleared.cjs', id: 'AML_001' },
                    { file: 'aml_story_2_sar.cjs', id: 'AML_002' },
                    { file: 'aml_story_3_network_sar.cjs', id: 'AML_003' },
                    { file: 'aml_story_4_hitl_decision.cjs', id: 'AML_004' }
                ];
                let totalDelay = 0;
                scripts.forEach((script) => {
                    setTimeout(() => {
                        const scriptPath = path.join(__dirname, 'simulation_scripts', script.file);
                        const child = exec(`node "${scriptPath}" > "${scriptPath}.log" 2>&1`, (error) => {
                            if (error && error.code !== 0) console.error(`${script.file} error:`, error.message);
                            runningProcesses.delete(script.id);
                        });
                        runningProcesses.set(script.id, child);
                    }, totalDelay * 1000);
                    totalDelay += 2;
                });
            }, 1000);
        });
        return jsonResponse(res, { status: 'ok' });
    }

    // --- GET Handlers ---
    if (req.method === 'GET') {
        if (cleanPath === '/email-status') return jsonResponse(res, { sent: state.sent });

        if (cleanPath === '/signal-status') {
            try { return jsonResponse(res, JSON.parse(fs.readFileSync(SIGNALS_PATH, 'utf8'))); }
            catch(e) { return jsonResponse(res, {}); }
        }

        if (cleanPath === '/debug-paths') {
            return jsonResponse(res, { dataDir: DATA_DIR, exists: fs.existsSync(DATA_DIR), files: fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : [] });
        }

        if (cleanPath === '/api/feedback/queue') {
            try { return jsonResponse(res, { queue: JSON.parse(fs.readFileSync(FEEDBACK_QUEUE_PATH, 'utf8')) }); }
            catch(e) { return jsonResponse(res, { queue: [] }); }
        }

        if (cleanPath === '/api/kb/content') {
            const versionId = parsedUrl.query.versionId;
            if (versionId) {
                try {
                    const versions = JSON.parse(fs.readFileSync(KB_VERSIONS_PATH, 'utf8'));
                    const version = versions.find(v => v.id === versionId);
                    if (version) {
                        const snapshotPath = path.join(SNAPSHOTS_DIR, version.snapshotFile);
                        return jsonResponse(res, { content: fs.readFileSync(snapshotPath, 'utf8') });
                    }
                } catch(e) {}
            }
            try { return jsonResponse(res, { content: fs.readFileSync(KB_PATH, 'utf8') }); }
            catch(e) { return jsonResponse(res, { content: '' }); }
        }

        if (cleanPath === '/api/kb/versions') {
            try { return jsonResponse(res, { versions: JSON.parse(fs.readFileSync(KB_VERSIONS_PATH, 'utf8')) }); }
            catch(e) { return jsonResponse(res, { versions: [] }); }
        }

        if (cleanPath.startsWith('/api/kb/snapshot/')) {
            const filename = cleanPath.replace('/api/kb/snapshot/', '');
            const snapshotPath = path.join(SNAPSHOTS_DIR, filename);
            try {
                const content = fs.readFileSync(snapshotPath, 'utf8');
                res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/markdown' });
                return res.end(content);
            } catch(e) { return jsonResponse(res, { error: 'Snapshot not found' }, 404); }
        }

        // Static file serving
        let filePath = cleanPath === '/' ? '/index.html' : cleanPath;
        const fullPath = path.join(PUBLIC_DIR, filePath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const ext = path.extname(fullPath);
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            const content = fs.readFileSync(fullPath);
            res.writeHead(200, { ...corsHeaders, 'Content-Type': contentType });
            return res.end(content);
        }
        // SPA fallback
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/html' });
            return res.end(fs.readFileSync(indexPath));
        }
    }

    // --- POST Handlers ---
    if (req.method === 'POST') {
        const parsed = await parseBody(req);

        if (cleanPath === '/email-status') {
            state.sent = parsed.sent !== undefined ? parsed.sent : true;
            return jsonResponse(res, { status: 'ok' });
        }

        if (cleanPath === '/signal') {
            try {
                const signals = JSON.parse(fs.readFileSync(SIGNALS_PATH, 'utf8'));
                if (parsed.signal) signals[parsed.signal] = true;
                fs.writeFileSync(SIGNALS_PATH, JSON.stringify(signals, null, 4));
            } catch(e) {}
            return jsonResponse(res, { status: 'ok' });
        }

        if (cleanPath === '/api/update-status') {
            try {
                const processes = JSON.parse(fs.readFileSync(PROCESSES_PATH, 'utf8'));
                const proc = processes.find(p => p.id === parsed.id);
                if (proc) {
                    if (parsed.currentStatus) proc.currentStatus = parsed.currentStatus;
                    if (parsed.status) proc.status = parsed.status;
                    fs.writeFileSync(PROCESSES_PATH, JSON.stringify(processes, null, 4));
                }
            } catch(e) {}
            return jsonResponse(res, { status: 'ok' });
        }

        if (cleanPath === '/api/chat') {
            let contents, systemInstruction;
            if (parsed.messages && parsed.systemPrompt) {
                systemInstruction = parsed.systemPrompt;
                contents = parsed.messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
            } else {
                systemInstruction = `You are an AI assistant for AML Investigations. Use the following knowledge base to answer questions:\n\n${parsed.knowledgeBase || ''}`;
                contents = [];
                if (parsed.history) {
                    parsed.history.forEach(h => {
                        contents.push({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] });
                    });
                }
                if (parsed.message) contents.push({ role: 'user', parts: [{ text: parsed.message }] });
            }
            const response = await callGemini(contents, systemInstruction);
            return jsonResponse(res, { response });
        }

        if (cleanPath === '/api/feedback/questions') {
            const prompt = `Given this feedback about an AML Investigations knowledge base:\n"${parsed.feedback}"\n\nAnd the current knowledge base content:\n${parsed.knowledgeBase || ''}\n\nGenerate exactly 3 clarifying questions to better understand the feedback. Return as a JSON array of strings.`;
            const result = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], 'You generate clarifying questions. Return only a JSON array of 3 strings.');
            try { return jsonResponse(res, { questions: JSON.parse(result.replace(/```json\n?|\n?```/g, '')) }); }
            catch(e) { return jsonResponse(res, { questions: ['Could you elaborate?', 'What specific section?', 'What would you change?'] }); }
        }

        if (cleanPath === '/api/feedback/summarize') {
            const qaPairs = (parsed.questions || []).map((q, i) => `Q: ${q}\nA: ${(parsed.answers || [])[i] || 'No answer'}`).join('\n');
            const prompt = `Summarize this feedback into a clear, actionable proposal for updating the knowledge base.\n\nOriginal feedback: "${parsed.feedback}"\n\nClarifying Q&A:\n${qaPairs}\n\nCurrent KB:\n${parsed.knowledgeBase || ''}\n\nProvide a concise summary of what should change.`;
            const result = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], 'You summarize feedback into actionable KB update proposals.');
            return jsonResponse(res, { summary: result });
        }

        if (cleanPath === '/api/feedback/queue') {
            try {
                const queue = JSON.parse(fs.readFileSync(FEEDBACK_QUEUE_PATH, 'utf8'));
                queue.push({ ...parsed, status: 'pending', timestamp: new Date().toISOString() });
                fs.writeFileSync(FEEDBACK_QUEUE_PATH, JSON.stringify(queue, null, 2));
            } catch(e) {}
            return jsonResponse(res, { status: 'ok' });
        }

        if (cleanPath === '/api/feedback/apply') {
            try {
                const queue = JSON.parse(fs.readFileSync(FEEDBACK_QUEUE_PATH, 'utf8'));
                const item = queue.find(i => i.id === parsed.feedbackId);
                if (!item) return jsonResponse(res, { error: 'Item not found' }, 404);
                const currentKB = fs.readFileSync(KB_PATH, 'utf8');
                const prompt = `Apply this feedback to the knowledge base. Return ONLY the updated knowledge base content, nothing else.\n\nFeedback: ${item.summary}\n\nCurrent KB:\n${currentKB}`;
                const updatedKB = await callGemini([{ role: 'user', parts: [{ text: prompt }] }], 'You update knowledge base documents. Return only the updated content.');
                const timestamp = new Date().toISOString();
                const versionId = `v_${Date.now()}`;
                const snapshotFile = `snapshot_${versionId}.md`;
                const previousFile = `previous_${versionId}.md`;
                fs.writeFileSync(path.join(SNAPSHOTS_DIR, previousFile), currentKB);
                fs.writeFileSync(path.join(SNAPSHOTS_DIR, snapshotFile), updatedKB);
                fs.writeFileSync(KB_PATH, updatedKB);
                const versions = JSON.parse(fs.readFileSync(KB_VERSIONS_PATH, 'utf8'));
                versions.push({ id: versionId, timestamp, snapshotFile, previousFile, changes: [item.summary] });
                fs.writeFileSync(KB_VERSIONS_PATH, JSON.stringify(versions, null, 2));
                item.status = 'applied';
                fs.writeFileSync(FEEDBACK_QUEUE_PATH, JSON.stringify(queue, null, 2));
                return jsonResponse(res, { success: true, content: updatedKB });
            } catch(e) { console.error('Apply error:', e); return jsonResponse(res, { error: e.message }, 500); }
        }

        if (cleanPath === '/api/kb/update') {
            try {
                fs.writeFileSync(KB_PATH, parsed.content || '');
                return jsonResponse(res, { status: 'ok' });
            } catch(e) { return jsonResponse(res, { error: e.message }, 500); }
        }
    }

    // --- DELETE Handler ---
    if (req.method === 'DELETE' && cleanPath.startsWith('/api/feedback/queue/')) {
        const itemId = cleanPath.replace('/api/feedback/queue/', '');
        try {
            let queue = JSON.parse(fs.readFileSync(FEEDBACK_QUEUE_PATH, 'utf8'));
            queue = queue.filter(i => i.id !== itemId);
            fs.writeFileSync(FEEDBACK_QUEUE_PATH, JSON.stringify(queue, null, 2));
        } catch(e) {}
        return jsonResponse(res, { status: 'ok' });
    }

    // --- 404 ---
    jsonResponse(res, { error: 'Not found' }, 404);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`AML Investigations Demo Server running on port ${PORT}`);
});

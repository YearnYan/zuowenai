require('dotenv').config();

const path = require('path');
const express = require('express');
const OpenAI = require('openai');

const app = express();

function normalizeBaseUrl(rawUrl = '') {
    const trimmed = String(rawUrl || '').trim();
    if (!trimmed) {
        return 'https://api.linapi.net/v1';
    }

    return trimmed.replace(/\/chat\/completions\/?$/i, '');
}

function isValidMessage(item) {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.role !== 'string' || !item.role.trim()) return false;

    const content = item.content;
    if (typeof content === 'string') return true;
    if (Array.isArray(content)) return content.length > 0;
    return false;
}

const configuredBaseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gemini-3-flash-preview';
const port = Number(process.env.PORT) || 5173;

if (!apiKey) {
    console.error('缺少 OPENAI_API_KEY，请先在 .env 中配置后再启动服务。');
    process.exit(1);
}

const client = new OpenAI({
    apiKey,
    baseURL: configuredBaseUrl
});

app.use(express.json({ limit: '20mb' }));
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    const { messages, temperature, max_tokens } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isValidMessage)) {
        return res.status(400).json({
            error: {
                message: '参数错误：messages 必须为有效的非空消息数组'
            }
        });
    }

    try {
        const response = await client.chat.completions.create({
            model,
            messages,
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            max_tokens: typeof max_tokens === 'number' ? max_tokens : 2500
        });

        return res.json(response);
    } catch (error) {
        const upstreamStatus = error?.status || error?.response?.status;
        const upstreamMessage = error?.error?.message || error?.message || '上游模型请求失败';

        console.error('调用模型失败:', {
            status: upstreamStatus,
            message: upstreamMessage
        });

        return res.status(upstreamStatus || 500).json({
            error: {
                message: upstreamMessage
            }
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`服务已启动：http://127.0.0.1:${port}`);
    console.log(`模型：${model}`);
    console.log(`中转站：${configuredBaseUrl}/chat/completions`);
});

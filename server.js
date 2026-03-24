const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');

const { createEssayService } = require('./services/essay-core.cjs');

dotenv.config();

const DEFAULT_BASE_URL = 'https://api.linapi.net/v1';
const DEFAULT_MODEL = 'gemini-3-flash-preview';
const DEFAULT_PORT = 5173;

function normalizeBaseUrl(rawUrl = '') {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) {
    return DEFAULT_BASE_URL;
  }

  return trimmed.replace(/\/chat\/completions\/?$/i, '');
}

function readMessage(error, fallback = '服务异常') {
  const message = error?.message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return fallback;
}

function readStatusCode(error, fallback = 500) {
  const statusCode = Number(error?.statusCode);
  if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599) {
    return statusCode;
  }

  return fallback;
}

function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const configuredBaseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL);
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('缺少 OPENAI_API_KEY，请先在 .env 中配置后再启动服务。');
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey,
    baseURL: configuredBaseUrl
  });

  const essayService = createEssayService({ client, model });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '20mb' }));
  app.use(express.static(path.resolve(__dirname, 'dist'), {
    index: false,
    fallthrough: true,
    maxAge: '1h'
  }));

  app.get('/api/bootstrap', (req, res) => {
    res.json({
      default_grade_key: essayService.defaultGradeKey,
      grade_catalog: essayService.getGradeCatalog()
    });
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const result = await essayService.analyzeEssay(req.body || {});
      res.json(result);
    } catch (error) {
      const statusCode = readStatusCode(error, 500);
      if (statusCode >= 500) {
        console.error('作文分析失败:', {
          statusCode,
          message: readMessage(error, '作文分析失败')
        });
      }

      res.status(statusCode).json({
        error: {
          message: readMessage(error, '作文分析失败')
        }
      });
    }
  });

  app.post('/api/sample-essay', async (req, res) => {
    try {
      const result = await essayService.generateSampleEssay(req.body || {});
      res.json(result);
    } catch (error) {
      const statusCode = readStatusCode(error, 500);
      if (statusCode >= 500) {
        console.error('范文生成失败:', {
          statusCode,
          message: readMessage(error, '范文生成失败')
        });
      }

      res.status(statusCode).json({
        error: {
          message: readMessage(error, '范文生成失败')
        }
      });
    }
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`服务已启动：http://127.0.0.1:${port}`);
    console.log(`模型：${model}`);
    console.log(`中转站：${configuredBaseUrl}/chat/completions`);
    console.log('静态目录：dist（生产构建产物）');
  });
}

createServer();

import OpenAI from 'openai';
import { createEssayService } from './services/essay-core.mjs';

const DEFAULT_BASE_URL = 'https://api.linapi.net/v1';
const DEFAULT_MODEL = 'gemini-3-flash-preview';

function normalizeBaseUrl(rawUrl = '') {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  return trimmed.replace(/\/chat\/completions\/?$/i, '');
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders()
    }
  });
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

function createEssayServiceFromEnv(env) {
  if (!env.OPENAI_API_KEY) {
    throw Object.assign(new Error('缺少 OPENAI_API_KEY 密钥配置'), { statusCode: 500 });
  }

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: normalizeBaseUrl(env.OPENAI_BASE_URL || DEFAULT_BASE_URL)
  });

  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  return createEssayService({ client, model });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method === 'GET' && url.pathname === '/api/bootstrap') {
      try {
        const service = createEssayServiceFromEnv(env);
        return json({
          default_grade_key: service.defaultGradeKey,
          grade_catalog: service.getGradeCatalog()
        });
      } catch (error) {
        return json({ error: { message: readMessage(error) } }, readStatusCode(error));
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/analyze') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: { message: '请求体必须是 JSON' } }, 400);
      }

      try {
        const service = createEssayServiceFromEnv(env);
        const result = await service.analyzeEssay(body || {});
        return json(result, 200);
      } catch (error) {
        return json({ error: { message: readMessage(error, '作文分析失败') } }, readStatusCode(error));
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/sample-essay') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: { message: '请求体必须是 JSON' } }, 400);
      }

      try {
        const service = createEssayServiceFromEnv(env);
        const result = await service.generateSampleEssay(body || {});
        return json(result, 200);
      } catch (error) {
        return json({ error: { message: readMessage(error, '范文生成失败') } }, readStatusCode(error));
      }
    }

    return env.ASSETS.fetch(request);
  }
};

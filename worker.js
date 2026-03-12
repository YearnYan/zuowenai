import OpenAI from "openai";

const DEFAULT_BASE_URL = "https://api.linapi.net/v1";
const DEFAULT_MODEL = "gemini-3-flash-preview";

function normalizeBaseUrl(rawUrl = "") {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  return trimmed.replace(/\/chat\/completions\/?$/i, "");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

function isValidMessage(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.role !== "string" || !item.role.trim()) return false;

  const content = item.content;
  if (typeof content === "string") return Boolean(content.trim());
  if (Array.isArray(content)) return content.length > 0;
  return false;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname === "/api/chat") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type"
        }
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!env.OPENAI_API_KEY) {
        return json({ error: { message: "缺少 OPENAI_API_KEY 密钥配置" } }, 500);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: { message: "请求体必须是 JSON" } }, 400);
      }

      const { messages, temperature, max_tokens } = body || {};
      if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isValidMessage)) {
        return json({ error: { message: "参数错误：messages 必须为有效的非空消息数组" } }, 400);
      }

      const client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        baseURL: normalizeBaseUrl(env.OPENAI_BASE_URL || DEFAULT_BASE_URL)
      });

      try {
        const response = await client.chat.completions.create({
          model: env.OPENAI_MODEL || DEFAULT_MODEL,
          messages,
          temperature: typeof temperature === "number" ? temperature : 0.7,
          max_tokens: typeof max_tokens === "number" ? max_tokens : 2500
        });

        return json(response, 200);
      } catch (error) {
        const upstreamStatus = error?.status || error?.response?.status;
        const upstreamMessage = error?.error?.message || error?.message || "上游模型请求失败";
        return json({ error: { message: upstreamMessage } }, upstreamStatus || 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};

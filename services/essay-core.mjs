const DEFAULT_GRADE_KEY = 'middle-1';

const ESSAY_LANGUAGE = Object.freeze({
  ENGLISH: 'english',
  CHINESE: 'chinese'
});

const GRADE_CONFIG = Object.freeze({
  'elementary-3': {
    optionLabel: '三年级',
    name: '小学三年级',
    level: '入门级',
    description: '重点掌握基础日常词汇（200-300词）',
    keywords: ['颜色', '数字', '家庭成员', '身体部位', '常见动物', '食物'],
    avoid: ['good', 'bad', 'big', 'small', 'like', 'want'],
    targetWords: ['great', 'wonderful', 'large', 'tiny', 'enjoy', 'wish'],
    difficulty: '替换词应在小学高年级词汇范围内（不超过500词）',
    examFocus: '侧重于简单的形容词、名词、动词替换'
  },
  'elementary-4': {
    optionLabel: '四年级',
    name: '小学四年级',
    level: '基础级',
    description: '扩展词汇量至500词，开始使用简单形容词',
    keywords: ['天气', '季节', '运动', '爱好', '学校用品'],
    avoid: ['good', 'bad', 'happy', 'sad', 'nice', 'fun'],
    targetWords: ['excellent', 'terrible', 'delighted', 'upset', 'pleasant', 'enjoyable'],
    difficulty: '替换词应在小学高年级到初中低年级词汇范围',
    examFocus: '形容词、副词的基础替换，简单同义词'
  },
  'elementary-5': {
    optionLabel: '五年级',
    name: '小学五年级',
    level: '进阶级',
    description: '词汇量达到600-800词，能使用常见短语',
    keywords: ['节日', '职业', '交通工具', '时间表达'],
    avoid: ['very', 'really', 'a lot', 'get', 'make', 'thing'],
    targetWords: ['extremely', 'truly', 'numerous', 'obtain', 'create', 'item/object'],
    difficulty: '替换词应在初中词汇范围内',
    examFocus: '副词强化、动词精确化、避免模糊词汇'
  },
  'elementary-6': {
    optionLabel: '六年级',
    name: '小学六年级',
    level: '小学毕业',
    description: '小升初水平，词汇量800-1000词',
    keywords: ['情绪描述', '简单议论', '过去时态', '将来时态'],
    avoid: ['some', 'many', 'a little', 'go', 'do', 'have'],
    targetWords: ['several', 'numerous', 'slightly', 'proceed', 'accomplish', 'possess'],
    difficulty: '替换词应在初中常用词汇范围',
    examFocus: '词汇精准性、时态搭配、简单学术词汇引入'
  },
  'middle-1': {
    optionLabel: '初一',
    name: '初中一年级',
    level: '初中入门',
    description: '词汇量1000-1500词，开始接触中考高频词',
    keywords: ['描述性形容词', '常用动词短语', '连接词'],
    avoid: ['important', 'interesting', 'beautiful', 'think', 'say', 'but'],
    targetWords: ['significant', 'fascinating', 'gorgeous', 'believe', 'express', 'however'],
    difficulty: '替换词应在中考1600词范围内',
    examFocus: '中考高频词汇、形容词深化、连接词升级'
  },
  'middle-2': {
    optionLabel: '初二',
    name: '初中二年级',
    level: '初中进阶',
    description: '词汇量1500-2000词，掌握中考核心词汇',
    keywords: ['议论文词汇', '因果关系', '对比词汇', '情感细节'],
    avoid: ['good for', 'because', 'so', 'different', 'same', 'also'],
    targetWords: ['beneficial', 'due to', 'therefore', 'distinct', 'identical', 'moreover'],
    difficulty: '替换词应体现中考写作水平',
    examFocus: '逻辑连接词、议论文常用表达、情感词汇细化'
  },
  'middle-3': {
    optionLabel: '初三',
    name: '初中三年级',
    level: '中考冲刺',
    description: '中考1600词+拓展词汇，接近高中水平',
    keywords: ['书面语表达', '高级句式词汇', '抽象概念'],
    avoid: ['I think', 'in my opinion', 'more and more', 'nowadays', 'people'],
    targetWords: ['From my perspective', 'In my view', 'increasingly', 'currently', 'individuals'],
    difficulty: '替换词应达到中考满分作文标准',
    examFocus: '避免口语化、书面语规范、中考作文高分词汇'
  },
  'high-1': {
    optionLabel: '高一',
    name: '高中一年级',
    level: '高中基础',
    description: '词汇量2000-2500词，开始积累高考词汇',
    keywords: ['学术词汇', '正式表达', '复杂情感', '社会话题'],
    avoid: ['a lot of', 'lots of', 'big problem', 'very important'],
    targetWords: ['numerous', 'abundant', 'significant issue', 'crucial'],
    difficulty: '替换词应在高考3500词范围内',
    examFocus: '正式书面语、学术词汇引入、避免非正式表达'
  },
  'high-2': {
    optionLabel: '高二',
    name: '高中二年级',
    level: '高中进阶',
    description: '词汇量2500-3000词，掌握高考核心词汇',
    keywords: ['议论文高级词汇', '熟词生义', '固定搭配', '同义替换'],
    avoid: ['show', 'tell', 'give', 'help', 'useful'],
    targetWords: ['demonstrate', 'illustrate', 'provide', 'facilitate', 'beneficial'],
    difficulty: '替换词应体现高考优秀作文水平',
    examFocus: '高考写作高频词汇、熟词生义、地道搭配'
  },
  'high-3': {
    optionLabel: '高三',
    name: '高中三年级',
    level: '高考冲刺',
    description: '高考3500词+拓展，达到大学入门水平',
    keywords: ['高考满分词汇', '高级句式衔接', '学术规范表达'],
    avoid: ['for example', 'first/second/third', 'in the end', 'more and more important'],
    targetWords: ['for instance', 'primarily/subsequently/ultimately', 'eventually', 'increasingly significant'],
    difficulty: '替换词应达到高考满分作文或雅思6.0+水平',
    examFocus: '高考作文高分标准、避免低分表达、学术规范性'
  }
});

const GRADE_GROUPS = Object.freeze([
  {
    key: 'elementary',
    label: '小学',
    grades: ['elementary-3', 'elementary-4', 'elementary-5', 'elementary-6']
  },
  {
    key: 'middle',
    label: '初中',
    grades: ['middle-1', 'middle-2', 'middle-3']
  },
  {
    key: 'high',
    label: '高中',
    grades: ['high-1', 'high-2', 'high-3']
  }
]);

function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function resolveGradeKey(gradeKey) {
  return GRADE_CONFIG[gradeKey] ? gradeKey : DEFAULT_GRADE_KEY;
}

function normalizeEssayLanguage(language) {
  if (!language) return null;

  const normalized = String(language).trim().toLowerCase();
  if (['chinese', 'zh', 'zh-cn', '中文', '语文', '汉语'].includes(normalized)) {
    return ESSAY_LANGUAGE.CHINESE;
  }

  if (['english', 'en', 'en-us', '英文', '英语'].includes(normalized)) {
    return ESSAY_LANGUAGE.ENGLISH;
  }

  return null;
}

function detectEssayLanguage(text = '') {
  const chineseCount = (String(text).match(/[\u4e00-\u9fff]/g) || []).length;
  const englishCount = (String(text).match(/[A-Za-z]/g) || []).length;

  if (chineseCount === 0 && englishCount === 0) {
    return ESSAY_LANGUAGE.ENGLISH;
  }

  return chineseCount >= englishCount ? ESSAY_LANGUAGE.CHINESE : ESSAY_LANGUAGE.ENGLISH;
}

function parseModelJsonContent(content = '') {
  const rawText = String(content || '').trim();
  const candidates = [];

  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    candidates.push(codeBlockMatch[1].trim());
  }

  if (rawText) {
    candidates.push(rawText);
  }

  const startIndex = rawText.indexOf('{');
  const endIndex = rawText.lastIndexOf('}');
  if (startIndex !== -1 && endIndex > startIndex) {
    candidates.push(rawText.slice(startIndex, endIndex + 1).trim());
  }

  for (const candidate of [...new Set(candidates)]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // 继续尝试下一种格式
    }
  }

  throw createError('AI返回格式错误，请重试', 502);
}

function normalizeAnalysisResult(result, fallbackText = '', fallbackLanguage = null, fallbackGradeKey = DEFAULT_GRADE_KEY) {
  const safeResult = result && typeof result === 'object' ? result : {};
  const originalText = typeof safeResult.original_text === 'string' && safeResult.original_text.trim()
    ? safeResult.original_text.trim()
    : String(fallbackText || '').trim();

  const normalizedLanguage = normalizeEssayLanguage(safeResult.essay_language)
    || fallbackLanguage
    || detectEssayLanguage(originalText);

  const levelFallback = ['基础', '进阶', '高级'];
  const lowLevelWords = (Array.isArray(safeResult.low_level_words) ? safeResult.low_level_words : [])
    .filter((item) => item && typeof item.word === 'string' && item.word.trim())
    .map((item) => {
      const suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
      const normalizedSuggestions = suggestions
        .filter((sug) => sug && typeof sug.word === 'string' && sug.word.trim())
        .map((sug, index) => ({
          word: sug.word.trim(),
          level: typeof sug.level === 'string' && sug.level.trim() ? sug.level.trim() : (levelFallback[index] || '进阶'),
          explanation: typeof sug.explanation === 'string' ? sug.explanation.trim() : '',
          example: typeof sug.example === 'string' ? sug.example.trim() : ''
        }));

      return {
        word: item.word.trim(),
        sentence: typeof item.sentence === 'string' ? item.sentence.trim() : '',
        reason: typeof item.reason === 'string' ? item.reason.trim() : '',
        suggestions: normalizedSuggestions
      };
    });

  return {
    essay_language: normalizedLanguage,
    original_text: originalText,
    grade_level: typeof safeResult.grade_level === 'string' && safeResult.grade_level.trim()
      ? safeResult.grade_level.trim()
      : GRADE_CONFIG[fallbackGradeKey]?.name || '',
    grade_key: typeof safeResult.grade_key === 'string' && GRADE_CONFIG[safeResult.grade_key]
      ? safeResult.grade_key
      : fallbackGradeKey,
    low_level_words: lowLevelWords
  };
}

function normalizeSampleEssayResult(result, fallbackLanguage = ESSAY_LANGUAGE.CHINESE) {
  const safeResult = result && typeof result === 'object' ? result : {};
  const optimizedEssay = typeof safeResult.optimized_essay === 'string'
    ? safeResult.optimized_essay.trim()
    : '';
  const appliedSuggestions = (Array.isArray(safeResult.applied_suggestions) ? safeResult.applied_suggestions : [])
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());
  const polishSummary = typeof safeResult.polish_summary === 'string'
    ? safeResult.polish_summary.trim()
    : '';

  return {
    essay_language: normalizeEssayLanguage(safeResult.essay_language) || fallbackLanguage,
    optimized_essay: optimizedEssay,
    applied_suggestions: appliedSuggestions,
    polish_summary: polishSummary
  };
}

function looksLikeEssayText(text = '') {
  const normalized = String(text || '').trim();
  if (!normalized || normalized.length < 80) return false;

  const header = normalized.slice(0, 80).toLowerCase();
  const suspiciousPrefixes = ['抱歉', '无法', '错误', 'error', 'sorry', 'cannot', 'failed', 'json'];
  if (suspiciousPrefixes.some((prefix) => header.includes(prefix))) {
    return false;
  }

  const sentenceCount = (normalized.match(/[。！？.!?]/g) || []).length;
  const paragraphCount = normalized.split(/\n+/).filter(Boolean).length;

  return sentenceCount >= 3 || paragraphCount >= 3;
}

function buildSuggestionDigest(lowLevelWords = []) {
  if (!Array.isArray(lowLevelWords) || lowLevelWords.length === 0) {
    return '暂无具体替换建议，请在保留原文立意的前提下全面提升表达质量。';
  }

  return lowLevelWords.slice(0, 20).map((item, idx) => {
    const suggestionWords = Array.isArray(item.suggestions)
      ? item.suggestions.map((s) => s.word).filter(Boolean).join(' / ')
      : '';
    return `${idx + 1}. 待优化：${item.word}；建议：${suggestionWords || '请结合语境优化'}；原因：${item.reason || '表达层次可提升'}`;
  }).join('\n');
}

function buildSampleEssaySystemPrompt(gradeConfig, essayLanguage) {
  if (essayLanguage === ESSAY_LANGUAGE.CHINESE) {
    return `你是一个语文作文示范写作助手。请根据原文和改词建议，生成一篇优化后的完整范文。

## 写作目标
- 适用年级：${gradeConfig.name}
- 年级水平：${gradeConfig.level}
- 考点侧重：${gradeConfig.examFocus}
- 难度标准：${gradeConfig.difficulty}

## 生成要求
1. 保持原文主题、立意和主要事件不偏离。
2. 优先吸收“改词建议”里的表达升级方向，使语言更准确、更有层次。
3. 保持学生作文可达成的表达风格，不使用生僻古奥词。
4. 字数与原文大体相当（允许上下浮动约20%）。
5. 只输出JSON，不要输出额外解释或markdown。

## 输出JSON格式
{
  "optimized_essay": "优化后的完整中文范文",
  "applied_suggestions": ["被采用的关键词或表达1", "表达2"],
  "polish_summary": "一句话说明本次优化重点"
}`;
  }

  return `You are an English writing polishing assistant. Based on the original essay and revision suggestions, generate a complete improved model essay.

## Student profile
- Grade: ${gradeConfig.name}
- Level: ${gradeConfig.level}
- Focus: ${gradeConfig.examFocus}
- Difficulty target: ${gradeConfig.difficulty}

## Requirements
1. Keep the original topic, viewpoint, and core story consistent.
2. Absorb the revision suggestions naturally and upgrade word choice.
3. Keep the writing level realistic for the target grade.
4. Keep similar length to the original essay (around +/-20%).
5. Return JSON only, without markdown.

## Output JSON
{
  "optimized_essay": "the complete polished English essay",
  "applied_suggestions": ["applied expression 1", "expression 2"],
  "polish_summary": "one-sentence summary of what was improved"
}`;
}

function buildEnglishSystemPrompt(gradeConfig) {
  return `你是一个专业的英语作文批改助手，正在为【${gradeConfig.name}】学生批改作文。

## 年级信息
- 年级水平：${gradeConfig.level}
- 学习目标：${gradeConfig.description}
- 重点词汇领域：${gradeConfig.keywords.join('、')}
- 难度标准：${gradeConfig.difficulty}
- 考点侧重：${gradeConfig.examFocus}

## 你的任务

1. **识别低级词汇**：重点识别以下类型的简单词汇
   - 高频简单词：${gradeConfig.avoid.join(', ')}
   - 其他过于简单、模糊或口语化的词汇

2. **提供替换建议**：为每个识别出的低级词汇提供3个更高级的替换词，要求：
   - **符合年级水平**：替换词应该是${gradeConfig.name}学生能够理解和使用的
   - **考点相关**：优先选择${gradeConfig.examFocus}相关的词汇
   - **语境适配**：替换词必须符合原句语境，不能生硬
   - **难度递进**：3个建议按难度递增排列（基础→进阶→高级）
   - **附带例句**：每个替换词配一个清晰易懂的例句

3. **参考示例**：
   - 应避免的词：${gradeConfig.avoid.join(', ')}
   - 推荐使用的词：${gradeConfig.targetWords.join(', ')}

## 输出格式

请严格按以下JSON格式返回结果（不要包含markdown代码块标记）：

{
  "essay_language": "english",
  "original_text": "原文",
  "grade_level": "${gradeConfig.name}",
  "low_level_words": [
    {
      "word": "识别到的低级词汇",
      "sentence": "该词汇所在的原句",
      "reason": "为什么这个词不够好（针对该年级）",
      "suggestions": [
        {
          "word": "替换词汇1（基础）",
          "level": "基础",
          "explanation": "对这个词的简短讲解，包括词义、用法特点、适用场景等（1-2句话）",
          "example": "使用该词汇的例句"
        },
        {
          "word": "替换词汇2（进阶）",
          "level": "进阶",
          "explanation": "对这个词的简短讲解，包括词义、用法特点、适用场景等（1-2句话）",
          "example": "使用该词汇的例句"
        },
        {
          "word": "替换词汇3（高级）",
          "level": "高级",
          "explanation": "对这个词的简短讲解，包括词义、用法特点、适用场景等（1-2句话）",
          "example": "使用该词汇的例句"
        }
      ]
    }
  ]
}

## 重要提醒
- 只识别真正不符合该年级水平的词汇
- 不要过度纠正，保持学生的表达风格
- 替换建议要实用，不要选择过于生僻的词
- 必须严格返回JSON格式，不要包含其他文字或markdown标记`;
}

function buildChineseSystemPrompt(gradeConfig) {
  return `你是一个专业的语文作文改词助手，正在为【${gradeConfig.name}】学生优化作文表达。

## 年级信息
- 年级水平：${gradeConfig.level}
- 学习目标：${gradeConfig.description}
- 难度标准：${gradeConfig.difficulty}
- 考点侧重：${gradeConfig.examFocus}

## 你的任务

1. **识别表达层次偏低的词语**：重点识别以下问题
   - 过于口语化、空泛、重复或表达力度不足的词语/短语
   - 搭配不够准确、语义不够具体、书面感不足的表达

2. **提供替换建议**：为每个识别出的词语提供3个更优表达，要求：
   - **符合年级水平**：替换词应符合${gradeConfig.name}学生写作能力
   - **贴合原句语境**：可直接替换或小幅调整后自然通顺
   - **难度递进**：按“基础→进阶→高级”给出
   - **附带示例**：每个替换词提供一条示例句（可参考原句改写）

## 输出格式

请严格按以下JSON格式返回结果（不要包含markdown代码块标记）：

{
  "essay_language": "chinese",
  "original_text": "原文",
  "grade_level": "${gradeConfig.name}",
  "low_level_words": [
    {
      "word": "识别到的低级词语",
      "sentence": "该词语所在的原句",
      "reason": "为什么这个词语表达层次较低（针对该年级）",
      "suggestions": [
        {
          "word": "替换词语1（基础）",
          "level": "基础",
          "explanation": "简要解释词义和适用语境（1-2句话）",
          "example": "使用该词语的示例句"
        },
        {
          "word": "替换词语2（进阶）",
          "level": "进阶",
          "explanation": "简要解释词义和适用语境（1-2句话）",
          "example": "使用该词语的示例句"
        },
        {
          "word": "替换词语3（高级）",
          "level": "高级",
          "explanation": "简要解释词义和适用语境（1-2句话）",
          "example": "使用该词语的示例句"
        }
      ]
    }
  ]
}

## 重要提醒
- 重点优化词语质量，不改写文章立意与结构
- 不要给出生僻、古奥、脱离学生实际的词语
- 替换建议要实用，适合课堂教学与考试写作
- 必须严格返回JSON格式，不要包含其他文字或markdown标记`;
}

function extractResponseContent(response) {
  const content = response?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.text === 'string') return item.text;
        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

async function requestModel(client, model, messages, temperature, maxTokens) {
  try {
    return await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });
  } catch (error) {
    const message = error?.error?.message || error?.message || '上游模型请求失败';
    const statusCode = error?.status || error?.response?.status || 502;
    throw createError(message, statusCode);
  }
}

async function extractEssayFromImage(client, model, imageBase64) {
  const ocrPrompt = `你是作文图片识别助手，请先做OCR再判断语言。

要求：
1. 准确提取整篇作文正文，去掉题号、页码等无关内容。
2. 判断作文语言：中文或英文。
3. 只返回JSON，不要输出其他文本。

返回格式：
{
  "essay_language": "chinese 或 english",
  "original_text": "提取出的作文全文"
}`;

  const response = await requestModel(
    client,
    model,
    [
      { role: 'system', content: ocrPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageBase64 }
          },
          {
            type: 'text',
            text: '请识别图片中的作文全文并判断是中文作文还是英文作文，按指定JSON返回。'
          }
        ]
      }
    ],
    0.2,
    2000
  );

  const content = extractResponseContent(response);
  const parsed = parseModelJsonContent(content);
  const originalText = typeof parsed.original_text === 'string' ? parsed.original_text.trim() : '';

  if (!originalText) {
    throw createError('图片识别失败：未提取到作文内容', 422);
  }

  return {
    essay_language: normalizeEssayLanguage(parsed.essay_language) || detectEssayLanguage(originalText),
    original_text: originalText
  };
}

async function analyzeEssay(payload, client, model) {
  const mode = String(payload?.mode || 'text').toLowerCase() === 'image' ? 'image' : 'text';
  const gradeKey = resolveGradeKey(payload?.grade_key || payload?.gradeKey);

  let essayText = typeof payload?.text === 'string' ? payload.text.trim() : '';
  let essayLanguage = detectEssayLanguage(essayText);

  if (mode === 'image') {
    const imageBase64 = typeof payload?.image_base64 === 'string'
      ? payload.image_base64
      : payload?.imageBase64;

    if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
      throw createError('请先上传作文图片', 400);
    }

    if (imageBase64.length > 16 * 1024 * 1024) {
      throw createError('图片体积过大，请压缩后重试', 413);
    }

    const imageResult = await extractEssayFromImage(client, model, imageBase64);
    essayText = imageResult.original_text;
    essayLanguage = imageResult.essay_language;
  }

  if (!essayText) {
    throw createError('未检测到有效作文内容', 400);
  }

  if (essayText.length > 12000) {
    throw createError('作文内容过长，请控制在12000字以内', 413);
  }

  const gradeConfig = GRADE_CONFIG[gradeKey];
  const systemPrompt = essayLanguage === ESSAY_LANGUAGE.CHINESE
    ? buildChineseSystemPrompt(gradeConfig)
    : buildEnglishSystemPrompt(gradeConfig);

  const response = await requestModel(
    client,
    model,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: essayText }
    ],
    0.7,
    2500
  );

  const content = extractResponseContent(response);
  const parsedResult = parseModelJsonContent(content);

  return normalizeAnalysisResult(parsedResult, essayText, essayLanguage, gradeKey);
}

async function generateSampleEssay(payload, client, model) {
  const candidate = payload && typeof payload === 'object' && payload.analysis
    ? payload.analysis
    : payload;

  if (!candidate || typeof candidate !== 'object') {
    throw createError('缺少分析结果，无法生成范文', 400);
  }

  const fallbackGradeKey = resolveGradeKey(candidate.grade_key || payload?.grade_key || payload?.gradeKey);
  const normalizedAnalysis = normalizeAnalysisResult(
    candidate,
    candidate.original_text || '',
    normalizeEssayLanguage(candidate.essay_language) || detectEssayLanguage(candidate.original_text || ''),
    fallbackGradeKey
  );

  if (!normalizedAnalysis.original_text) {
    throw createError('缺少原文内容，无法生成范文', 400);
  }

  const gradeKey = resolveGradeKey(normalizedAnalysis.grade_key);
  const gradeConfig = GRADE_CONFIG[gradeKey];
  const essayLanguage = normalizedAnalysis.essay_language;
  const suggestionDigest = buildSuggestionDigest(normalizedAnalysis.low_level_words);
  const systemPrompt = buildSampleEssaySystemPrompt(gradeConfig, essayLanguage);

  const userPrompt = essayLanguage === ESSAY_LANGUAGE.CHINESE
    ? `请基于以下内容生成优化后的完整中文范文。\n\n【原文】\n${normalizedAnalysis.original_text}\n\n【改词建议摘要】\n${suggestionDigest}`
    : `Please generate a complete polished English model essay based on the following info.\n\n[Original Essay]\n${normalizedAnalysis.original_text}\n\n[Revision Suggestions]\n${suggestionDigest}`;

  const response = await requestModel(
    client,
    model,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    0.7,
    3000
  );

  const content = extractResponseContent(response);

  try {
    const parsed = parseModelJsonContent(content);
    const normalized = normalizeSampleEssayResult(parsed, essayLanguage);

    if (!normalized.optimized_essay) {
      throw createError('范文内容为空', 502);
    }

    return normalized;
  } catch (error) {
    const plainText = String(content || '')
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();

    if (!looksLikeEssayText(plainText)) {
      throw error.statusCode ? error : createError('AI返回格式异常，未生成有效范文，请重试', 502);
    }

    return normalizeSampleEssayResult(
      { optimized_essay: plainText, applied_suggestions: [], polish_summary: '' },
      essayLanguage
    );
  }
}

export function createEssayService({ client, model }) {
  if (!client || typeof client.chat?.completions?.create !== 'function') {
    throw createError('模型客户端初始化失败', 500);
  }

  if (!model || typeof model !== 'string') {
    throw createError('模型配置无效', 500);
  }

  return {
    defaultGradeKey: DEFAULT_GRADE_KEY,
    getGradeCatalog() {
      return GRADE_GROUPS.map((group) => ({
        key: group.key,
        label: group.label,
        grades: group.grades.map((gradeKey) => ({
          key: gradeKey,
          label: GRADE_CONFIG[gradeKey].optionLabel
        }))
      }));
    },
    async analyzeEssay(payload) {
      return analyzeEssay(payload || {}, client, model);
    },
    async generateSampleEssay(payload) {
      return generateSampleEssay(payload || {}, client, model);
    }
  };
}

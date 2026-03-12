// API配置
const API_CONFIG = {
    url: '/api/chat',
};

// DOM元素
const elements = {
    tabs: document.querySelectorAll('.tab'),
    textTab: document.getElementById('text-tab'),
    imageTab: document.getElementById('image-tab'),
    gradeBtns: document.querySelectorAll('.grade-btn'),
    essayInput: document.getElementById('essay-input'),
    imageInput: document.getElementById('image-input'),
    uploadArea: document.getElementById('upload-area'),
    previewImage: document.getElementById('preview-image'),
    analyzeBtn: document.getElementById('analyze-btn'),
    btnText: document.querySelector('.btn-text'),
    loader: document.querySelector('.loader'),
    resultSection: document.getElementById('result-section'),
    annotatedText: document.getElementById('annotated-text'),
    vocabItems: document.getElementById('vocab-items'),
    generateSampleBtn: document.getElementById('generate-sample-btn'),
    sampleEssayCard: document.getElementById('sample-essay-card'),
    sampleEssayMeta: document.getElementById('sample-essay-meta'),
    sampleEssayContent: document.getElementById('sample-essay-content'),
    copySampleBtn: document.getElementById('copy-sample-btn'),
    copyBtn: document.getElementById('copy-btn'),
    downloadBtn: document.getElementById('download-btn')
};

// 全局状态
let currentMode = 'text';
let uploadedImageBase64 = null;
let analysisResult = null;
let sampleEssayResult = null;
let latestSampleRequestId = 0;
let selectedGrade = 'middle-1'; // 默认初一

// 年级配置：定义不同年级的词汇难度和考点
const GRADE_CONFIG = {
    'elementary-3': {
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
        name: '高中三年级',
        level: '高考冲刺',
        description: '高考3500词+拓展，达到大学入门水平',
        keywords: ['高考满分词汇', '高级句式衔接', '学术规范表达'],
        avoid: ['for example', 'first/second/third', 'in the end', 'more and more important'],
        targetWords: ['for instance', 'primarily/subsequently/ultimately', 'eventually', 'increasingly significant'],
        difficulty: '替换词应达到高考满分作文或雅思6.0+水平',
        examFocus: '高考作文高分标准、避免低分表达、学术规范性'
    }
};

// 作文语言类型
const ESSAY_LANGUAGE = {
    ENGLISH: 'english',
    CHINESE: 'chinese'
};

// 识别作文语言（按中英文字符占比判断）
function detectEssayLanguage(text = '') {
    const chineseCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishCount = (text.match(/[A-Za-z]/g) || []).length;

    if (chineseCount === 0 && englishCount === 0) {
        return ESSAY_LANGUAGE.ENGLISH;
    }

    return chineseCount >= englishCount ? ESSAY_LANGUAGE.CHINESE : ESSAY_LANGUAGE.ENGLISH;
}

// 归一化语言标识
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

// 转义正则特殊字符，避免替换异常
function escapeRegExp(text = '') {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 转义HTML字符，避免将范文内容当作标签解析
function escapeHtml(text = '') {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 将多行纯文本转换为可展示HTML
function formatMultilineText(text = '') {
    return escapeHtml(text).replace(/\n/g, '<br>');
}

// 判断文本是否像一篇完整作文，避免把报错文本当范文
function looksLikeEssayText(text = '') {
    const normalized = String(text || '').trim();
    if (!normalized || normalized.length < 80) return false;

    const header = normalized.slice(0, 80).toLowerCase();
    const suspiciousPrefixes = ['抱歉', '无法', '错误', 'error', 'sorry', 'cannot', 'failed', 'json'];
    if (suspiciousPrefixes.some(prefix => header.includes(prefix))) {
        return false;
    }

    const sentenceCount = (normalized.match(/[。！？.!?]/g) || []).length;
    const paragraphCount = normalized.split(/\n+/).filter(Boolean).length;

    return sentenceCount >= 3 || paragraphCount >= 3;
}

// 将批改建议整理成可读摘要，供范文生成使用
function buildSuggestionDigest(lowLevelWords = []) {
    if (!Array.isArray(lowLevelWords) || lowLevelWords.length === 0) {
        return '暂无具体替换建议，请在保留原文立意的前提下全面提升表达质量。';
    }

    return lowLevelWords.slice(0, 20).map((item, idx) => {
        const suggestionWords = Array.isArray(item.suggestions)
            ? item.suggestions.map(s => s.word).filter(Boolean).join(' / ')
            : '';
        return `${idx + 1}. 待优化：${item.word}；建议：${suggestionWords || '请结合语境优化'}；原因：${item.reason || '表达层次可提升'}`;
    }).join('\n');
}

// 构建范文生成系统提示词
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

// 规范化范文结果结构
function normalizeSampleEssayResult(result, fallbackLanguage = ESSAY_LANGUAGE.CHINESE) {
    const safeResult = (result && typeof result === 'object') ? result : {};
    const optimizedEssay = typeof safeResult.optimized_essay === 'string'
        ? safeResult.optimized_essay.trim()
        : '';
    const appliedSuggestions = (Array.isArray(safeResult.applied_suggestions) ? safeResult.applied_suggestions : [])
        .filter(item => typeof item === 'string' && item.trim())
        .map(item => item.trim());
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

// 英语作文提示词（保留原有英语改词逻辑）
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

// 语文作文提示词（新增中文改词逻辑）
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

// 标签页切换
elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        currentMode = tabName;

        // 切换激活状态
        elements.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 显示对应内容
        if (tabName === 'text') {
            elements.textTab.classList.remove('hidden');
            elements.imageTab.classList.add('hidden');
        } else {
            elements.textTab.classList.add('hidden');
            elements.imageTab.classList.remove('hidden');
        }
    });
});

// 年级按钮切换
elements.gradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有active状态
        elements.gradeBtns.forEach(b => b.classList.remove('active'));
        // 添加当前按钮的active状态
        btn.classList.add('active');
        // 更新选中的年级
        selectedGrade = btn.dataset.grade;
    });
});

// 图片上传处理
elements.uploadArea.addEventListener('click', () => {
    elements.imageInput.click();
});

elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImageBase64 = event.target.result;
            elements.previewImage.src = uploadedImageBase64;
            elements.previewImage.classList.remove('hidden');
            elements.uploadArea.querySelector('.upload-prompt').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// 拖拽上传
elements.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#667eea';
});

elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.style.borderColor = '#d0d0d0';
});

elements.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#d0d0d0';

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImageBase64 = event.target.result;
            elements.previewImage.src = uploadedImageBase64;
            elements.previewImage.classList.remove('hidden');
            elements.uploadArea.querySelector('.upload-prompt').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// 分析按钮点击
elements.analyzeBtn.addEventListener('click', async () => {
    let content = '';

    if (currentMode === 'text') {
        content = elements.essayInput.value.trim();
        if (!content) {
            alert('请输入作文内容');
            return;
        }
    } else {
        if (!uploadedImageBase64) {
            alert('请先上传作文图片');
            return;
        }
    }

    // 新一轮分析前重置范文状态，避免显示上次结果
    resetSampleEssayPanel();

    // 显示加载状态
    setLoading(true);

    try {
        const result = await analyzeEssay(content, uploadedImageBase64);
        displayResults(result);
    } catch (error) {
        console.error('分析失败:', error);
        alert(error?.message || '分析失败，请检查网络连接或稍后重试');
    } finally {
        setLoading(false);
    }
});

// 根据批改建议生成范文
elements.generateSampleBtn.addEventListener('click', async () => {
    if (!analysisResult) {
        alert('请先完成作文分析');
        return;
    }

    const requestId = ++latestSampleRequestId;
    const analysisSnapshot = analysisResult;
    setSampleLoading(true);

    try {
        const result = await generateSampleEssay(analysisSnapshot);

        // 若期间已开始新一轮分析或新一轮范文生成，则丢弃过期结果
        if (requestId !== latestSampleRequestId || analysisSnapshot !== analysisResult) {
            return;
        }

        displaySampleEssay(result);
    } catch (error) {
        if (requestId !== latestSampleRequestId) {
            return;
        }

        console.error('范文生成失败:', error);
        alert(error?.message || '范文生成失败，请稍后重试');
    } finally {
        if (requestId === latestSampleRequestId) {
            setSampleLoading(false);
        }
    }
});

// 复制范文
elements.copySampleBtn.addEventListener('click', () => {
    if (!sampleEssayResult?.optimized_essay) return;

    navigator.clipboard.writeText(sampleEssayResult.optimized_essay).then(() => {
        alert('范文已复制到剪贴板！');
    }).catch((error) => {
        console.error('复制范文失败:', error);
        alert('复制失败，请手动复制');
    });
});

// 设置加载状态
function setLoading(isLoading) {
    elements.analyzeBtn.disabled = isLoading;
    elements.generateSampleBtn.disabled = isLoading || !analysisResult;
    if (isLoading) {
        elements.btnText.classList.add('hidden');
        elements.loader.classList.remove('hidden');
    } else {
        elements.btnText.classList.remove('hidden');
        elements.loader.classList.add('hidden');
    }
}

// 读取后端错误信息，便于前端定位问题
async function readApiErrorMessage(response, fallback = '请求失败，请稍后重试') {
    try {
        const errorData = await response.json();
        if (typeof errorData?.error?.message === 'string' && errorData.error.message.trim()) {
            return errorData.error.message.trim();
        }
    } catch (error) {
        // 忽略解析失败，回退到默认文案
    }

    return `${fallback}（HTTP ${response.status}）`;
}

// 设置范文按钮加载状态
function setSampleLoading(isLoading) {
    elements.generateSampleBtn.disabled = isLoading || !analysisResult;
    elements.generateSampleBtn.classList.toggle('loading', isLoading);
    elements.generateSampleBtn.textContent = isLoading
        ? '⏳ 正在生成优化范文...'
        : '✍️ 根据修改建议生成范文';
}

// 重置范文展示区域
function resetSampleEssayPanel() {
    latestSampleRequestId += 1;
    sampleEssayResult = null;
    elements.sampleEssayCard.classList.add('hidden');
    elements.sampleEssayMeta.textContent = '';
    elements.sampleEssayContent.innerHTML = '';
    elements.copySampleBtn.disabled = true;
    setSampleLoading(false);
}

// 渲染范文结果
function displaySampleEssay(result) {
    sampleEssayResult = result;
    const sourceLabel = result.essay_language === ESSAY_LANGUAGE.CHINESE ? '语文表达优化' : 'English wording upgrade';
    const appliedText = Array.isArray(result.applied_suggestions) && result.applied_suggestions.length > 0
        ? `已吸收建议：${result.applied_suggestions.slice(0, 6).join('、')}`
        : '已结合批改建议完成整体润色';
    const summaryText = result.polish_summary ? `；优化重点：${result.polish_summary}` : '';

    elements.sampleEssayMeta.textContent = `${sourceLabel}｜${appliedText}${summaryText}`;
    elements.sampleEssayContent.innerHTML = formatMultilineText(result.optimized_essay || '');
    elements.sampleEssayCard.classList.remove('hidden');
    elements.copySampleBtn.disabled = !result.optimized_essay;
}

// 解析模型返回的JSON内容（兼容代码块包裹）
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
        } catch (error) {
            // 忽略单次解析错误，尝试下一个候选
        }
    }

    throw new Error('AI返回格式错误，请重试');
}

// 规范化分析结果结构，避免前端渲染异常
function normalizeAnalysisResult(result, fallbackText = '', fallbackLanguage = null, fallbackGradeKey = selectedGrade) {
    const safeResult = (result && typeof result === 'object') ? result : {};
    const originalText = typeof safeResult.original_text === 'string' && safeResult.original_text.trim()
        ? safeResult.original_text.trim()
        : fallbackText;
    const normalizedLanguage = normalizeEssayLanguage(safeResult.essay_language)
        || fallbackLanguage
        || detectEssayLanguage(originalText);

    const levelFallback = ['基础', '进阶', '高级'];
    const lowLevelWords = (Array.isArray(safeResult.low_level_words) ? safeResult.low_level_words : [])
        .filter(item => item && typeof item.word === 'string' && item.word.trim())
        .map(item => {
            const suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
            const normalizedSuggestions = suggestions
                .filter(sug => sug && typeof sug.word === 'string' && sug.word.trim())
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
            : (GRADE_CONFIG[fallbackGradeKey]?.name || ''),
        grade_key: typeof safeResult.grade_key === 'string' && GRADE_CONFIG[safeResult.grade_key]
            ? safeResult.grade_key
            : fallbackGradeKey,
        low_level_words: lowLevelWords
    };
}

// 图片OCR：先提取作文文本并识别语言
async function extractEssayFromImage(imageBase64) {
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

    const response = await fetch(API_CONFIG.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
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
            temperature: 0.2,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const errorMessage = await readApiErrorMessage(response, '图片识别失败');
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parseModelJsonContent(content);

    const originalText = typeof parsed.original_text === 'string' ? parsed.original_text.trim() : '';
    if (!originalText) {
        throw new Error('图片识别失败：未提取到作文内容');
    }

    return {
        essay_language: normalizeEssayLanguage(parsed.essay_language) || detectEssayLanguage(originalText),
        original_text: originalText
    };
}

// 调用AI分析作文
async function analyzeEssay(text, imageBase64) {
    let essayText = text;
    let essayLanguage = detectEssayLanguage(text);

    if (currentMode === 'image' && imageBase64) {
        const imageResult = await extractEssayFromImage(imageBase64);
        essayText = imageResult.original_text;
        essayLanguage = imageResult.essay_language;
    }

    if (!essayText || !essayText.trim()) {
        throw new Error('未检测到有效作文内容');
    }

    const analysisGradeKey = selectedGrade;
    const gradeConfig = GRADE_CONFIG[analysisGradeKey];
    const systemPrompt = essayLanguage === ESSAY_LANGUAGE.CHINESE
        ? buildChineseSystemPrompt(gradeConfig)
        : buildEnglishSystemPrompt(gradeConfig);

    const response = await fetch(API_CONFIG.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: essayText }
            ],
            temperature: 0.7,
            max_tokens: 2500
        })
    });

    if (!response.ok) {
        const errorMessage = await readApiErrorMessage(response, '作文分析失败');
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    try {
        const parsedResult = parseModelJsonContent(content);
        return normalizeAnalysisResult(parsedResult, essayText, essayLanguage, analysisGradeKey);
    } catch (error) {
        console.error('JSON解析失败:', content);
        throw error;
    }
}

// 调用AI根据批改建议生成范文
async function generateSampleEssay(currentAnalysis) {
    if (!currentAnalysis?.original_text) {
        throw new Error('缺少原文内容，无法生成范文');
    }

    const analysisGradeKey = currentAnalysis.grade_key && GRADE_CONFIG[currentAnalysis.grade_key]
        ? currentAnalysis.grade_key
        : selectedGrade;
    const gradeConfig = GRADE_CONFIG[analysisGradeKey];
    const essayLanguage = currentAnalysis.essay_language || detectEssayLanguage(currentAnalysis.original_text);
    const suggestionDigest = buildSuggestionDigest(currentAnalysis.low_level_words);
    const systemPrompt = buildSampleEssaySystemPrompt(gradeConfig, essayLanguage);

    const userPrompt = essayLanguage === ESSAY_LANGUAGE.CHINESE
        ? `请基于以下内容生成优化后的完整中文范文。\n\n【原文】\n${currentAnalysis.original_text}\n\n【改词建议摘要】\n${suggestionDigest}`
        : `Please generate a complete polished English model essay based on the following info.\n\n[Original Essay]\n${currentAnalysis.original_text}\n\n[Revision Suggestions]\n${suggestionDigest}`;

    const response = await fetch(API_CONFIG.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000
        })
    });

    if (!response.ok) {
        const errorMessage = await readApiErrorMessage(response, '范文生成请求失败');
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    try {
        const parsed = parseModelJsonContent(content);
        const normalized = normalizeSampleEssayResult(parsed, essayLanguage);

        if (!normalized.optimized_essay) {
            throw new Error('范文内容为空');
        }

        return normalized;
    } catch (error) {
        const plainText = String(content).replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        if (!looksLikeEssayText(plainText)) {
            throw new Error('AI返回格式异常，未生成有效范文，请重试');
        }

        return normalizeSampleEssayResult(
            { optimized_essay: plainText, applied_suggestions: [], polish_summary: '' },
            essayLanguage
        );
    }
}

// 显示分析结果
function displayResults(result) {
    analysisResult = normalizeAnalysisResult(
        result,
        result?.original_text || '',
        result?.essay_language || null,
        result?.grade_key || selectedGrade
    );
    resetSampleEssayPanel();
    elements.generateSampleBtn.disabled = false;

    const isChineseEssay = analysisResult.essay_language === ESSAY_LANGUAGE.CHINESE;
    const exampleLabel = isChineseEssay ? '示例' : '例句';

    // 生成批注文本
    let annotatedHTML = analysisResult.original_text;

    // 高亮标注低级词语/词汇
    analysisResult.low_level_words.forEach((item) => {
        const escapedWord = escapeRegExp(item.word);
        if (!escapedWord) return;

        const pattern = isChineseEssay ? escapedWord : `\\b${escapedWord}\\b`;
        const flags = isChineseEssay ? 'g' : 'gi';
        const regex = new RegExp(pattern, flags);

        annotatedHTML = annotatedHTML.replace(regex, (match) => {
            return `<span class="word-basic" title="点击查看替换建议">${match}</span>`;
        });
    });

    elements.annotatedText.innerHTML = annotatedHTML;

    // 按照词语/词汇在原文中出现顺序排序
    const sortableText = isChineseEssay
        ? analysisResult.original_text
        : analysisResult.original_text.toLowerCase();

    analysisResult.low_level_words.sort((a, b) => {
        const keywordA = isChineseEssay ? a.word : a.word.toLowerCase();
        const keywordB = isChineseEssay ? b.word : b.word.toLowerCase();
        const posA = sortableText.indexOf(keywordA);
        const posB = sortableText.indexOf(keywordB);

        if (posA === -1 && posB === -1) return 0;
        if (posA === -1) return 1;
        if (posB === -1) return -1;
        return posA - posB;
    });

    // 生成进步清单（带年级和难度标签）
    elements.vocabItems.innerHTML = analysisResult.low_level_words.map(item => `
        <div class="vocab-item">
            <div class="vocab-original">
                原句：<strong>${item.word}</strong> - "${item.sentence || analysisResult.original_text}"
                ${item.reason ? `<div class="vocab-reason">💡 ${item.reason}</div>` : ''}
            </div>
            <div class="vocab-suggestions">
                ${item.suggestions.map((sug, idx) => {
                    const levelClass = sug.level === '基础' ? 'level-basic' : (sug.level === '进阶' ? 'level-intermediate' : 'level-advanced');
                    return `
                    <div class="suggestion">
                        <div class="suggestion-word">
                            ${idx + 1}. ${sug.word}
                            ${sug.level ? `<span class="level-badge ${levelClass}">${sug.level}</span>` : ''}
                        </div>
                        ${sug.explanation ? `<div class="suggestion-explanation">📖 ${sug.explanation}</div>` : ''}
                        <div class="suggestion-example">${exampleLabel}：${sug.example || '暂无'}</div>
                    </div>
                `}).join('')}
            </div>
        </div>
    `).join('');

    // 显示结果区域
    elements.resultSection.classList.remove('hidden');
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 复制清单
elements.copyBtn.addEventListener('click', () => {
    if (!analysisResult) return;

    const isChineseEssay = analysisResult.essay_language === ESSAY_LANGUAGE.CHINESE;
    const nounLabel = isChineseEssay ? '词语' : '词汇';
    const exampleLabel = isChineseEssay ? '示例' : '例句';

    let text = `📝 ${nounLabel}进步清单\n\n`;
    analysisResult.low_level_words.forEach((item, idx) => {
        text += `${idx + 1}. ${item.word}\n`;
        text += `   原句：${item.sentence || analysisResult.original_text}\n`;
        text += `   替换建议：\n`;
        item.suggestions.forEach((sug, sidx) => {
            text += `   ${sidx + 1}) ${sug.word}【${sug.level}】\n`;
            if (sug.explanation) {
                text += `      讲解：${sug.explanation}\n`;
            }
            text += `      ${exampleLabel}：${sug.example || '暂无'}\n`;
        });
        text += '\n';
    });

    if (sampleEssayResult?.optimized_essay) {
        text += '📘 优化后完整范文\n';
        text += `${sampleEssayResult.optimized_essay}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
        alert('清单已复制到剪贴板！');
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
});

// 下载报告
elements.downloadBtn.addEventListener('click', () => {
    if (!analysisResult) return;

    const isChineseEssay = analysisResult.essay_language === ESSAY_LANGUAGE.CHINESE;
    const nounLabel = isChineseEssay ? '词语' : '词汇';
    const exampleLabel = isChineseEssay ? '示例' : '例句';
    const hasSampleEssay = Boolean(sampleEssayResult?.optimized_essay);
    const sampleEssayHtml = hasSampleEssay ? formatMultilineText(sampleEssayResult.optimized_essay) : '';
    const sampleSummary = hasSampleEssay
        ? escapeHtml(sampleEssayResult.polish_summary || '已根据改词建议完成整文升级')
        : '';

    // 创建新窗口用于打印PDF
    const printWindow = window.open('', '_blank');

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${nounLabel}进步报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Microsoft YaHei', SimHei, Arial, sans-serif;
            padding: 30px;
            color: #333;
            background: white;
            line-height: 1.6;
        }
        h1 { color: #2563eb; font-size: 22px; margin-bottom: 6px; }
        .time { color: #666; font-size: 12px; margin-bottom: 20px; }
        h2 { font-size: 16px; color: #333; margin-bottom: 12px; margin-top: 20px; }
        .original-text {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            line-height: 1.8;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .word-basic {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            color: #92400e;
            font-weight: 500;
        }
        .vocab-item {
            border-left: 3px solid #2563eb;
            padding: 12px 16px;
            margin-bottom: 16px;
            background: #f8fafc;
            border-radius: 0 8px 8px 0;
            page-break-inside: avoid;
        }
        .vocab-word { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
        .vocab-sentence { font-size: 13px; color: #666; margin-bottom: 10px; }
        .suggestion {
            background: white;
            padding: 10px 12px;
            margin: 8px 0;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .sug-word { font-weight: 600; color: #2563eb; font-size: 13px; margin-bottom: 4px; }
        .level-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            margin-left: 6px;
        }
        .level-basic { background: #dcfce7; color: #166534; }
        .level-intermediate { background: #fef3c7; color: #92400e; }
        .level-advanced { background: #fce7f3; color: #9d174d; }
        .explanation {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
            padding: 6px 8px;
            background: #f1f5f9;
            border-radius: 4px;
        }
        .example { font-size: 12px; color: #666; font-style: italic; }
        .sample-title { margin-top: 20px; font-size: 16px; color: #333; }
        .sample-summary {
            font-size: 12px;
            color: #475569;
            margin: 8px 0 10px;
            background: #eff6ff;
            border-radius: 6px;
            padding: 8px 10px;
        }
        .sample-essay {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            background: #ffffff;
            white-space: pre-wrap;
            line-height: 1.85;
            font-size: 14px;
        }
        .footer {
            margin-top: 24px;
            text-align: center;
            color: #999;
            font-size: 11px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
        }
        @media print {
            body { padding: 20px; }
            .vocab-item { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <h1>作文改词 - ${nounLabel}进步报告</h1>
    <p class="time">生成时间：${new Date().toLocaleString('zh-CN')}</p>

    <h2>原文批注</h2>
    <div class="original-text">${elements.annotatedText.innerHTML}</div>

    <h2>${nounLabel}进步清单</h2>
    ${analysisResult.low_level_words.map((item, idx) => `
        <div class="vocab-item">
            <div class="vocab-word">${idx + 1}. ${item.word}</div>
            <div class="vocab-sentence">原句：${item.sentence || analysisResult.original_text}</div>
            ${item.suggestions.map((sug) => {
                const levelClass = sug.level === '基础' ? 'level-basic' : (sug.level === '进阶' ? 'level-intermediate' : 'level-advanced');
                return `
                <div class="suggestion">
                    <div class="sug-word">
                        ${sug.word}
                        <span class="level-badge ${levelClass}">${sug.level}</span>
                    </div>
                    ${sug.explanation ? `<div class="explanation">${sug.explanation}</div>` : ''}
                    <div class="example">${exampleLabel}：${sug.example || '暂无'}</div>
                </div>
            `}).join('')}
        </div>
    `).join('')}

    ${hasSampleEssay ? `
    <h2 class="sample-title">优化后完整范文</h2>
    <div class="sample-summary">优化重点：${sampleSummary}</div>
    <div class="sample-essay">${sampleEssayHtml}</div>
    ` : ''}

    <div class="footer">Powered by 作文改词</div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
});

// 页面初始化
resetSampleEssayPanel();



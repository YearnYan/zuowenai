import './style.css';

const API_ENDPOINTS = {
  bootstrap: '/api/bootstrap',
  analyze: '/api/analyze',
  sampleEssay: '/api/sample-essay'
};

const ESSAY_LANGUAGE = Object.freeze({
  ENGLISH: 'english',
  CHINESE: 'chinese'
});

const elements = {
  tabs: document.querySelectorAll('.tab'),
  textTab: document.getElementById('text-tab'),
  imageTab: document.getElementById('image-tab'),
  gradeButtonsWrap: document.getElementById('grade-buttons-wrap'),
  essayInput: document.getElementById('essay-input'),
  imageInput: document.getElementById('image-input'),
  uploadArea: document.getElementById('upload-area'),
  previewImage: document.getElementById('preview-image'),
  analyzeBtn: document.getElementById('analyze-btn'),
  analyzeBtnText: document.querySelector('.btn-text'),
  analyzeLoader: document.querySelector('.loader'),
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

let currentMode = 'text';
let uploadedImageBase64 = null;
let analysisResult = null;
let sampleEssayResult = null;
let latestSampleRequestId = 0;
let defaultGradeKey = 'middle-1';
let selectedGrade = defaultGradeKey;

function escapeRegExp(text = '') {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultilineText(text = '') {
  return escapeHtml(text).replace(/\n/g, '<br>');
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

function normalizeAnalysisResult(result, fallbackText = '', fallbackLanguage = null, fallbackGradeKey = selectedGrade) {
  const safeResult = result && typeof result === 'object' ? result : {};
  const originalText = typeof safeResult.original_text === 'string' && safeResult.original_text.trim()
    ? safeResult.original_text.trim()
    : fallbackText;

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
      : '',
    grade_key: typeof safeResult.grade_key === 'string' && safeResult.grade_key.trim()
      ? safeResult.grade_key.trim()
      : fallbackGradeKey,
    low_level_words: lowLevelWords
  };
}

function normalizeSampleEssayResult(result, fallbackLanguage = ESSAY_LANGUAGE.CHINESE) {
  const safeResult = result && typeof result === 'object' ? result : {};

  return {
    essay_language: normalizeEssayLanguage(safeResult.essay_language) || fallbackLanguage,
    optimized_essay: typeof safeResult.optimized_essay === 'string' ? safeResult.optimized_essay.trim() : '',
    applied_suggestions: (Array.isArray(safeResult.applied_suggestions) ? safeResult.applied_suggestions : [])
      .filter((item) => typeof item === 'string' && item.trim())
      .map((item) => item.trim()),
    polish_summary: typeof safeResult.polish_summary === 'string' ? safeResult.polish_summary.trim() : ''
  };
}

async function readApiErrorMessage(response, fallback = '请求失败，请稍后重试') {
  try {
    const errorData = await response.json();
    if (typeof errorData?.error?.message === 'string' && errorData.error.message.trim()) {
      return errorData.error.message.trim();
    }
  } catch {
    // 忽略解析失败，回退默认错误
  }

  return `${fallback}（HTTP ${response.status}）`;
}

async function requestJson(url, options = {}, fallback = '请求失败，请稍后重试') {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, fallback));
  }

  return response.json();
}

function renderGradeButtons(gradeCatalog, selectedGradeKey) {
  const html = gradeCatalog.map((group) => {
    const buttons = (Array.isArray(group.grades) ? group.grades : []).map((grade) => {
      const activeClass = grade.key === selectedGradeKey ? ' active' : '';
      return `<button class="grade-btn${activeClass}" data-grade="${escapeHtml(grade.key)}">${escapeHtml(grade.label || grade.key)}</button>`;
    }).join('');

    return `
      <div class="grade-group">
        <div class="group-title">${escapeHtml(group.label || group.key || '')}</div>
        <div class="grade-buttons">
          ${buttons}
        </div>
      </div>
    `;
  }).join('');

  elements.gradeButtonsWrap.innerHTML = html;
}

function bindGradeButtonEvents() {
  elements.gradeButtonsWrap.querySelectorAll('.grade-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.gradeButtonsWrap.querySelectorAll('.grade-btn').forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      selectedGrade = btn.dataset.grade || defaultGradeKey;
    });
  });
}

function setLoading(isLoading) {
  elements.analyzeBtn.disabled = isLoading;
  elements.generateSampleBtn.disabled = isLoading || !analysisResult;

  if (isLoading) {
    elements.analyzeBtnText.classList.add('hidden');
    elements.analyzeLoader.classList.remove('hidden');
  } else {
    elements.analyzeBtnText.classList.remove('hidden');
    elements.analyzeLoader.classList.add('hidden');
  }
}

function setSampleLoading(isLoading) {
  elements.generateSampleBtn.disabled = isLoading || !analysisResult;
  elements.generateSampleBtn.classList.toggle('loading', isLoading);
  elements.generateSampleBtn.textContent = isLoading
    ? '⏳ 正在生成优化范文...'
    : '✍️ 根据修改建议生成范文';
}

function resetSampleEssayPanel() {
  latestSampleRequestId += 1;
  sampleEssayResult = null;
  elements.sampleEssayCard.classList.add('hidden');
  elements.sampleEssayMeta.textContent = '';
  elements.sampleEssayContent.innerHTML = '';
  elements.copySampleBtn.disabled = true;
  setSampleLoading(false);
}

function displaySampleEssay(result) {
  sampleEssayResult = normalizeSampleEssayResult(result, analysisResult?.essay_language || ESSAY_LANGUAGE.CHINESE);

  const sourceLabel = sampleEssayResult.essay_language === ESSAY_LANGUAGE.CHINESE
    ? '语文表达优化'
    : 'English wording upgrade';
  const appliedText = sampleEssayResult.applied_suggestions.length > 0
    ? `已吸收建议：${sampleEssayResult.applied_suggestions.slice(0, 6).join('、')}`
    : '已结合批改建议完成整体润色';
  const summaryText = sampleEssayResult.polish_summary ? `；优化重点：${sampleEssayResult.polish_summary}` : '';

  elements.sampleEssayMeta.textContent = `${sourceLabel}｜${appliedText}${summaryText}`;
  elements.sampleEssayContent.innerHTML = formatMultilineText(sampleEssayResult.optimized_essay || '');
  elements.sampleEssayCard.classList.remove('hidden');
  elements.copySampleBtn.disabled = !sampleEssayResult.optimized_essay;
}

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

  let annotatedHtml = analysisResult.original_text;

  analysisResult.low_level_words.forEach((item) => {
    const escapedWord = escapeRegExp(item.word);
    if (!escapedWord) return;

    const pattern = isChineseEssay ? escapedWord : `\\b${escapedWord}\\b`;
    const flags = isChineseEssay ? 'g' : 'gi';
    const regex = new RegExp(pattern, flags);

    annotatedHtml = annotatedHtml.replace(regex, (match) => `<span class="word-basic" title="点击查看替换建议">${match}</span>`);
  });

  elements.annotatedText.innerHTML = annotatedHtml;

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

  elements.vocabItems.innerHTML = analysisResult.low_level_words.map((item) => `
    <div class="vocab-item">
      <div class="vocab-original">
        原句：<strong>${escapeHtml(item.word)}</strong> - "${escapeHtml(item.sentence || analysisResult.original_text)}"
        ${item.reason ? `<div class="vocab-reason">💡 ${escapeHtml(item.reason)}</div>` : ''}
      </div>
      <div class="vocab-suggestions">
        ${item.suggestions.map((sug, idx) => {
          const levelClass = sug.level === '基础'
            ? 'level-basic'
            : (sug.level === '进阶' ? 'level-intermediate' : 'level-advanced');

          return `
            <div class="suggestion">
              <div class="suggestion-word">
                ${idx + 1}. ${escapeHtml(sug.word)}
                ${sug.level ? `<span class="level-badge ${levelClass}">${escapeHtml(sug.level)}</span>` : ''}
              </div>
              ${sug.explanation ? `<div class="suggestion-explanation">📖 ${escapeHtml(sug.explanation)}</div>` : ''}
              <div class="suggestion-example">${exampleLabel}：${escapeHtml(sug.example || '暂无')}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  elements.resultSection.classList.remove('hidden');
  elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

async function analyzeEssay() {
  if (currentMode === 'text') {
    const text = elements.essayInput.value.trim();
    if (!text) {
      alert('请输入作文内容');
      return;
    }

    return requestJson(API_ENDPOINTS.analyze, {
      method: 'POST',
      body: {
        mode: 'text',
        grade_key: selectedGrade,
        text
      }
    }, '作文分析失败');
  }

  if (!uploadedImageBase64) {
    alert('请先上传作文图片');
    return;
  }

  return requestJson(API_ENDPOINTS.analyze, {
    method: 'POST',
    body: {
      mode: 'image',
      grade_key: selectedGrade,
      image_base64: uploadedImageBase64
    }
  }, '作文分析失败');
}

async function generateSampleEssay() {
  if (!analysisResult) {
    alert('请先完成作文分析');
    return;
  }

  return requestJson(API_ENDPOINTS.sampleEssay, {
    method: 'POST',
    body: {
      analysis: analysisResult
    }
  }, '范文生成请求失败');
}

function buildCopyText() {
  const isChineseEssay = analysisResult.essay_language === ESSAY_LANGUAGE.CHINESE;
  const nounLabel = isChineseEssay ? '词语' : '词汇';
  const exampleLabel = isChineseEssay ? '示例' : '例句';

  let text = `📝 ${nounLabel}进步清单\n\n`;
  analysisResult.low_level_words.forEach((item, idx) => {
    text += `${idx + 1}. ${item.word}\n`;
    text += `   原句：${item.sentence || analysisResult.original_text}\n`;
    text += '   替换建议：\n';
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

  return text;
}

function buildReportHtml() {
  const isChineseEssay = analysisResult.essay_language === ESSAY_LANGUAGE.CHINESE;
  const nounLabel = isChineseEssay ? '词语' : '词汇';
  const exampleLabel = isChineseEssay ? '示例' : '例句';
  const hasSampleEssay = Boolean(sampleEssayResult?.optimized_essay);
  const sampleEssayHtml = hasSampleEssay ? formatMultilineText(sampleEssayResult.optimized_essay) : '';
  const sampleSummary = hasSampleEssay
    ? escapeHtml(sampleEssayResult.polish_summary || '已根据改词建议完成整文升级')
    : '';

  return `
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
      <div class="vocab-word">${idx + 1}. ${escapeHtml(item.word)}</div>
      <div class="vocab-sentence">原句：${escapeHtml(item.sentence || analysisResult.original_text)}</div>
      ${item.suggestions.map((sug) => {
        const levelClass = sug.level === '基础'
          ? 'level-basic'
          : (sug.level === '进阶' ? 'level-intermediate' : 'level-advanced');

        return `
          <div class="suggestion">
            <div class="sug-word">
              ${escapeHtml(sug.word)}
              <span class="level-badge ${levelClass}">${escapeHtml(sug.level || '')}</span>
            </div>
            ${sug.explanation ? `<div class="explanation">${escapeHtml(sug.explanation)}</div>` : ''}
            <div class="example">${exampleLabel}：${escapeHtml(sug.example || '暂无')}</div>
          </div>
        `;
      }).join('')}
    </div>
  `).join('')}

  ${hasSampleEssay ? `
    <h2 class="sample-title">优化后完整范文</h2>
    <div class="sample-summary">优化重点：${sampleSummary}</div>
    <div class="sample-essay">${sampleEssayHtml}</div>
  ` : ''}

  <div class="footer">Powered by 作文改词</div>

  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
`;
}

function bindCommonEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      currentMode = tabName;

      elements.tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');

      if (tabName === 'text') {
        elements.textTab.classList.remove('hidden');
        elements.imageTab.classList.add('hidden');
      } else {
        elements.textTab.classList.add('hidden');
        elements.imageTab.classList.remove('hidden');
      }
    });
  });

  elements.uploadArea.addEventListener('click', () => {
    elements.imageInput.click();
  });

  elements.imageInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      uploadedImageBase64 = loadEvent.target?.result;
      elements.previewImage.src = uploadedImageBase64;
      elements.previewImage.classList.remove('hidden');
      elements.uploadArea.querySelector('.upload-prompt').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  elements.uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    elements.uploadArea.style.borderColor = '#667eea';
  });

  elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.style.borderColor = '#d0d0d0';
  });

  elements.uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    elements.uploadArea.style.borderColor = '#d0d0d0';

    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      uploadedImageBase64 = loadEvent.target?.result;
      elements.previewImage.src = uploadedImageBase64;
      elements.previewImage.classList.remove('hidden');
      elements.uploadArea.querySelector('.upload-prompt').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  elements.analyzeBtn.addEventListener('click', async () => {
    resetSampleEssayPanel();
    setLoading(true);

    try {
      const result = await analyzeEssay();
      if (result) {
        displayResults(result);
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert(error?.message || '分析失败，请检查网络连接或稍后重试');
    } finally {
      setLoading(false);
    }
  });

  elements.generateSampleBtn.addEventListener('click', async () => {
    if (!analysisResult) {
      alert('请先完成作文分析');
      return;
    }

    const requestId = ++latestSampleRequestId;
    const analysisSnapshot = analysisResult;
    setSampleLoading(true);

    try {
      const result = await generateSampleEssay();
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

  elements.copySampleBtn.addEventListener('click', () => {
    if (!sampleEssayResult?.optimized_essay) return;

    navigator.clipboard.writeText(sampleEssayResult.optimized_essay).then(() => {
      alert('范文已复制到剪贴板！');
    }).catch((error) => {
      console.error('复制范文失败:', error);
      alert('复制失败，请手动复制');
    });
  });

  elements.copyBtn.addEventListener('click', () => {
    if (!analysisResult) return;

    navigator.clipboard.writeText(buildCopyText()).then(() => {
      alert('清单已复制到剪贴板！');
    }).catch((error) => {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    });
  });

  elements.downloadBtn.addEventListener('click', () => {
    if (!analysisResult) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许浏览器弹窗后重试');
      return;
    }

    printWindow.document.write(buildReportHtml());
    printWindow.document.close();
  });
}

async function bootstrap() {
  const data = await requestJson(API_ENDPOINTS.bootstrap, {}, '初始化失败');
  const gradeCatalog = Array.isArray(data?.grade_catalog) ? data.grade_catalog : [];
  defaultGradeKey = typeof data?.default_grade_key === 'string' ? data.default_grade_key : defaultGradeKey;
  selectedGrade = defaultGradeKey;

  renderGradeButtons(gradeCatalog, selectedGrade);
  bindGradeButtonEvents();
  bindCommonEvents();

  elements.resultSection.classList.add('hidden');
  resetSampleEssayPanel();
}

bootstrap().catch((error) => {
  console.error('初始化失败:', error);
  alert(error?.message || '初始化失败，请刷新页面重试');
});


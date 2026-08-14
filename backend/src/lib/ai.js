const fs = require('fs');
const os = require('os');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// AI 초안 제안은 선택 기능이고, 웹 UI에 자격증명을 입력받지 않는다 (GitHub 연동과
// 같은 원칙). 두 가지 방식 중 하나만 backend/.env에 준비돼 있으면 된다:
//
//   1) GEMINI_API_KEY (권장, 기본) — Google AI Studio(aistudio.google.com/apikey)에서
//      무료로 발급받는 키. Gemini는 개인 사용량 수준에서 완전 무료 요금제가 있어
//      Study Archive처럼 개인 아카이브용 보조 기능에 적합하다.
//   2) ANTHROPIC_API_KEY 또는 ANTHROPIC_AUTH_TOKEN(ant auth login) — Claude API.
//      단, 이건 Anthropic Console의 종량제 크레딧으로 과금되며, claude.ai
//      구독(Pro/Team 등)과는 별개다 (실제 호출해서 확인함 — 크레딧 부족 오류 발생).
//
// (한 때 로컬 `claude` CLI를 서브프로세스로 호출해 Claude Code 구독 인증을
// 재사용하는 방법도 시도했으나, Windows에서 .cmd 스크립트 spawn이 보안 정책상
// 막혀 있고(EINVAL) 애초에 CLI를 이런 용도로 쓰는 건 비공식적인 방법이라
// 포기했다. Gemini 무료 티어가 훨씬 안정적인 대안이다.)
//
// 어느 경로든 여기서 만든 결과는 그대로 저장되지 않는다 — 프론트가 폼 필드를
// 채워주고 사용자가 확인/수정한 뒤 직접 저장 버튼을 눌러야 실제로 반영된다.

function hasOAuthProfile() {
  const base =
    process.env.ANTHROPIC_CONFIG_DIR ||
    (process.platform === 'win32'
      ? path.join(process.env.APPDATA || '', 'Anthropic')
      : path.join(os.homedir(), '.config', 'anthropic'));
  try {
    const credDir = path.join(base, 'credentials');
    return fs.existsSync(credDir) && fs.readdirSync(credDir).length > 0;
  } catch {
    return false;
  }
}

function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function hasAnthropic() {
  return (
    Boolean(process.env.ANTHROPIC_API_KEY) ||
    Boolean(process.env.ANTHROPIC_AUTH_TOKEN) ||
    hasOAuthProfile()
  );
}

function isConfigured() {
  return hasGemini() || hasAnthropic();
}

function getClient() {
  if (!getClient._instance) {
    getClient._instance = new Anthropic();
  }
  return getClient._instance;
}

// 새 과제 등록 폼의 빈칸을 최대한 채워주기 위한 스키마. codeLanguage는 붙여넣기/단일
// 파일 분석에서 코드 블록 하나의 언어를 제안할 때만 쓰이고, 폴더 분석은 파일 확장자로
// 언어를 결정하므로 이 값을 쓰지 않는다. executionResult는 실제로 실행해본 게 아니라
// 코드를 읽고 추정한 값이므로, 사용자가 검증해야 한다는 걸 설명에 명시한다.
const SUGGESTION_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: '과제 제목 (간결한 한국어)' },
    subject: { type: 'string', description: '과목/분야 (예: Python, 자료구조, 웹개발)' },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '3~6개의 짧은 태그 (영문 소문자 또는 한국어, 예: python, 재귀)',
    },
    description: { type: 'string', description: '2~3문장의 한국어 설명 (무엇을 만드는/푸는 과제인지)' },
    codeLanguage: {
      type: 'string',
      description:
        "python|javascript|typescript|java|c|cpp|html|css|bash|json|sql 중 하나. 코드가 아니거나 해당 없으면 빈 문자열",
    },
    learnings: {
      type: 'string',
      description: '이 코드를 작성하며 배웠을 법한 개념 1~2문장 (한국어). 추정이 어려우면 빈 문자열',
    },
    difficulties: {
      type: 'string',
      description: '이 코드에서 어려웠을 법한 부분 1~2문장 (한국어). 추정이 어려우면 빈 문자열',
    },
    executionResult: {
      type: 'string',
      description:
        '코드를 실행하면 나올 것으로 예상되는 출력 (실제로 실행한 것이 아니라 코드를 읽고 추정한 값). 예측하기 어렵거나 코드가 아니면 빈 문자열',
    },
  },
  required: ['title', 'subject', 'tags', 'description', 'codeLanguage', 'learnings', 'difficulties', 'executionResult'],
  additionalProperties: false,
};

// Gemini의 schema 파서는 JSON Schema 전체 키워드를 다 지원하진 않아서
// additionalProperties처럼 애매한 키워드는 뺀 축소판을 따로 둔다.
const GEMINI_SUGGESTION_SCHEMA = {
  type: 'object',
  properties: SUGGESTION_SCHEMA.properties,
  required: SUGGESTION_SCHEMA.required,
};

// 붙여넣은 텍스트(content) 하나만 올 수도 있고, 폴더를 선택해 여러 파일(files)이
// 올 수도 있다. 폴더인 경우 파일별로 표시를 붙여 하나의 분석 대상 텍스트로 합친다.
function buildContentBlock({ content, filename, files }) {
  if (Array.isArray(files) && files.length > 0) {
    const perFileLimit = 4000;
    const combined = files
      .map((f) => `### 파일: ${f.name}\n${String(f.content || '').slice(0, perFileLimit)}`)
      .join('\n\n');
    return { text: combined.slice(0, 16000), label: `폴더 (${files.length}개 파일)` };
  }
  return { text: String(content || '').slice(0, 12000), label: filename || '붙여넣은 내용' };
}

function buildPrompt({ content, filename, files }) {
  const { text, label } = buildContentBlock({ content, filename, files });
  return [
    '다음은 개인 학습 과제 아카이브에 저장할 내용입니다.',
    `대상: ${label}`,
    '---',
    text,
    '---',
    '위 내용을 분석해서 과제 등록 폼의 빈칸을 최대한 채울 수 있도록 메타데이터를 제안해주세요.',
    '배운 점/어려웠던 점/실행 결과는 코드만 보고 하는 추정입니다 — 자신 있게 추정할 수 있을 때만 채우고,',
    '근거가 부족하면 억지로 만들어내지 말고 빈 문자열로 두세요.',
  ].join('\n');
}

function parseSuggestionText(text) {
  // 모델이 답변 앞뒤에 설명이나 ```json 코드블록을 덧붙이는 경우까지 관대하게 파싱한다.
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  const jsonSlice =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? candidate.slice(firstBrace, lastBrace + 1)
      : candidate;
  return JSON.parse(jsonSlice);
}

function validateSuggestion(obj) {
  const missing = SUGGESTION_SCHEMA.required.filter((key) => obj[key] === undefined);
  if (missing.length > 0) {
    const err = new Error(`AI 응답에 필요한 항목이 빠졌습니다: ${missing.join(', ')}`);
    err.code = 'EMPTY';
    throw err;
  }
  return obj;
}

const GEMINI_MODEL = 'gemini-3.6-flash';

// Google AI Studio의 무료 Gemini API 키로 분석한다 (기본 경로).
async function analyzeViaGemini({ content, filename, files }) {
  const prompt = buildPrompt({ content, filename, files });
  const apiKey = process.env.GEMINI_API_KEY;

  let res;
  try {
    res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: prompt,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: GEMINI_SUGGESTION_SCHEMA,
        },
      }),
    });
  } catch (err) {
    const e = new Error(`Gemini API 요청에 실패했습니다: ${err.message}`);
    e.code = 'NETWORK';
    throw e;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || `Gemini API 오류 (HTTP ${res.status})`;
    if (res.status === 401 || res.status === 403) {
      const e = new Error(`AI 분석 인증에 실패했습니다. backend/.env의 GEMINI_API_KEY를 확인해주세요. (${message})`);
      e.code = 'AUTH';
      throw e;
    }
    const e = new Error(message);
    e.code = 'GEMINI_ERROR';
    throw e;
  }

  const outputStep = (data?.steps || []).find((s) => s.type === 'model_output');
  const textBlock = outputStep?.content?.find((c) => c.type === 'text');
  if (!textBlock?.text) {
    const e = new Error('AI 응답에서 결과를 읽지 못했습니다. 잠시 후 다시 시도해주세요.');
    e.code = 'EMPTY';
    throw e;
  }

  return validateSuggestion(parseSuggestionText(textBlock.text));
}

// 기존 방식: @anthropic-ai/sdk로 직접 Messages API를 호출한다. GEMINI_API_KEY가
// 없을 때만 이 경로를 쓴다 (ANTHROPIC_API_KEY 또는 ant auth login OAuth 필요,
// Console 종량제 크레딧으로 과금됨).
async function analyzeViaAnthropic({ content, filename, files }) {
  const prompt = buildPrompt({ content, filename, files });

  let response;
  try {
    response = await getClient().messages.create({
      model: 'claude-opus-5',
      max_tokens: 4096,
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: SUGGESTION_SCHEMA },
      },
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    if (err?.status === 401) {
      const e = new Error(
        'AI 분석 인증에 실패했습니다. backend/.env의 ANTHROPIC_API_KEY를 확인하거나, ant auth login으로 다시 로그인해주세요.',
      );
      e.code = 'AUTH';
      throw e;
    }
    throw err;
  }

  if (response.stop_reason === 'refusal') {
    const err = new Error('AI가 이 내용을 분석할 수 없다고 응답했습니다.');
    err.code = 'REFUSED';
    throw err;
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    const err = new Error('AI 응답에서 결과를 읽지 못했습니다. 잠시 후 다시 시도해주세요.');
    err.code = 'EMPTY';
    throw err;
  }

  return validateSuggestion(JSON.parse(textBlock.text));
}

// 업로드/붙여넣은 내용(코드·텍스트, 단일 파일 또는 폴더)을 분석해 과제
// 메타데이터 초안을 제안한다. GEMINI_API_KEY가 있으면 그쪽을 우선 쓴다(무료).
async function analyzeContent({ content, filename, files }) {
  if (hasGemini()) {
    return analyzeViaGemini({ content, filename, files });
  }
  return analyzeViaAnthropic({ content, filename, files });
}

module.exports = { isConfigured, analyzeContent };

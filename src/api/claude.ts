export interface ParsedJob {
  company: string;
  position: string;
  techStack: string[];
  deadline: string;
  memo: string;
}

export async function parseJobPosting(text: string): Promise<ParsedJob> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  const prompt = `아래는 채용 공고 텍스트야. 다음 정보를 추출해줘.

공고 텍스트:
${text}

JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "company": "회사명",
  "position": "포지션명",
  "techStack": ["기술1", "기술2"],
  "deadline": "YYYY-MM-DD 형식, 없으면 빈 문자열",
  "memo": "주요 자격요건 요약 (2~3줄)"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 오류 ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content[0].text as string;
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("분석 결과를 파싱할 수 없습니다");
  return JSON.parse(match[0]) as ParsedJob;
}

export interface CoverLetter {
  motivation: string;
  competency: string;
  aspiration: string;
}

export async function generateCoverLetter(
  company: string,
  position: string,
  techStack: string[],
  memo: string,
  userExperience: string,
): Promise<CoverLetter> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  const prompt = `회사: ${company}
포지션: ${position}
기술스택: ${techStack.join(", ")}
공고 요약: ${memo || "없음"}
지원자 경험/강조사항: ${userExperience || "없음"}

위 정보를 바탕으로 자소서 초안을 작성해줘.
각 항목당 200~300자 분량으로, 구체적이고 자연스러운 한국어로 작성.

JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "motivation": "지원동기 내용",
  "competency": "직무역량 내용",
  "aspiration": "입사 후 포부 내용"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 오류 ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content[0].text as string;
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("자소서 생성 결과를 파싱할 수 없습니다");
  return JSON.parse(match[0]) as CoverLetter;
}

export interface MatchItem {
  label: string;
  status: "good" | "warning" | "bad" | "unknown";
  reason: string;
}

export interface MatchResult {
  score: number;
  items: MatchItem[];
  summary: string;
}

export async function analyzeJobMatch(
  profile: {
    techStack: string[];
    career: string;
    education: string;
    employmentType: string[];
    salary: string;
    location: string;
    introduction: string;
  },
  job: {
    company: string;
    position: string;
    techStack: string[];
    duties: string;
    memo: string;
    address: string;
    employmentType: string;
    career: string;
    wage: string;
    deadline: string | null;
  },
): Promise<MatchResult> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  const prompt = `너는 채용 전문가야. 아래 지원자 프로필과 채용 공고를 비교해서 적합도를 분석해줘.

[지원자 프로필]
- 기술스택: ${profile.techStack.join(", ") || "미입력"}
- 경력: ${profile.career || "미입력"}
- 학력: ${profile.education || "미입력"}
- 희망 고용형태: ${profile.employmentType.join(", ") || "미입력"}
- 희망 연봉: ${profile.salary || "미입력"}
- 희망 근무지역: ${profile.location || "미입력"}
- 자기소개: ${profile.introduction || "미입력"}

[채용 공고]
- 회사: ${job.company}
- 포지션: ${job.position}
- 기술스택: ${job.techStack.join(", ") || "정보 없음"}
- 고용형태: ${job.employmentType || "정보 없음"}
- 경력조건: ${job.career || "정보 없음"}
- 급여: ${job.wage || "정보 없음"}
- 근무지: ${job.address || "정보 없음"}
- 직무내용: ${job.duties || "정보 없음"}
- 기업안내: ${job.memo || "정보 없음"}

다음 JSON 형식으로만 반환 (다른 텍스트 없이):
{
  "score": 75,
  "items": [
    { "label": "기술스택", "status": "good", "reason": "React, TypeScript 일치" },
    { "label": "고용형태", "status": "good", "reason": "정규직 희망과 일치" },
    { "label": "경력조건", "status": "warning", "reason": "경력 3년 요구, 본인 1년" },
    { "label": "근무지역", "status": "bad", "reason": "희망 지역과 다름" },
    { "label": "급여", "status": "unknown", "reason": "급여 정보 없음" }
  ],
  "summary": "기술스택과 고용형태는 잘 맞지만 경력 조건이 다소 부족합니다."
}

status 기준: good(잘 맞음), warning(아쉬움), bad(불일치), unknown(정보없음)
score는 0~100 정수.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 오류 ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content[0].text as string;
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("분석 결과를 파싱할 수 없습니다");
  return JSON.parse(match[0]) as MatchResult;
}

export type AgentActionType = 'cover_letter' | 'calendar' | 'status_change' | 'apply_now'

export interface AgentSuggestion {
  jobId: string
  company: string
  position: string
  dday: number
  action: AgentActionType
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export async function analyzeUrgentJobs(
  jobs: {
    id: string
    company: string
    position: string
    status: string
    deadline: string | null
    coverLetter: unknown
    calendarEventId?: string
  }[]
): Promise<AgentSuggestion[]> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  const jobList = jobs.map((j) => {
    const diff = j.deadline
      ? Math.ceil((new Date(j.deadline).getTime() - Date.now()) / 86400000)
      : null
    return `- id:${j.id} | 회사:${j.company} | 포지션:${j.position} | 상태:${j.status} | D-Day:${diff ?? '없음'} | 자소서:${j.coverLetter ? '작성됨' : '미작성'} | 캘린더:${j.calendarEventId ? '등록됨' : '미등록'}`
  }).join('\n')

  const prompt = `너는 취업 준비를 도와주는 AI 에이전트야. 아래 마감 임박 공고들을 분석해서 각 공고에 대해 가장 중요한 액션 1개씩을 추천해줘.

공고 목록:
${jobList}

액션 유형:
- cover_letter: 자소서가 미작성이고 마감이 가까울 때
- calendar: 캘린더에 미등록된 공고
- status_change: 상태가 '관심'인데 마감이 3일 이내일 때
- apply_now: 지원 완료하지 않았고 마감이 1일 이내일 때

priority 기준:
- high: D-3 이내
- medium: D-4 ~ D-7
- low: 그 외

JSON 배열로만 반환 (다른 텍스트 없이):
[
  {
    "jobId": "id값",
    "company": "회사명",
    "position": "포지션명",
    "dday": 3,
    "action": "cover_letter",
    "reason": "마감 3일 전인데 자소서가 아직 작성되지 않았어요",
    "priority": "high"
  }
]`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`API 오류 ${res.status}`)

  const data = await res.json()
  const content = data.content[0].text as string
  const match = content.match(/\[[\s\S]*\]/)
  if (!match) return []
  return JSON.parse(match[0]) as AgentSuggestion[]
}

export async function suggestTechStack(
  company: string,
  position: string,
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  const prompt = `회사: ${company}
포지션: ${position}

이 회사의 이 포지션에서 실제로 사용하는 기술스택을 추천해줘.
해당 회사의 채용 공고, 기술 블로그, 실제 서비스 기반으로 추천.

JSON 배열로만 반환 (다른 텍스트 없이):
["기술1", "기술2", "기술3"]

최대 8개.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 오류 ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.content[0].text as string;
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]) as string[];
}

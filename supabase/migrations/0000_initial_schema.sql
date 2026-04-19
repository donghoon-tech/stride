-- 사용자 목표
CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL,          -- 'running', 'pullup', 등 자유 문자열
  title         TEXT NOT NULL,          -- "10km 49분 진입"
  target        JSONB NOT NULL,         -- { "distance_km": 10, "time_min": 49 }
  deadline      DATE,
  achieved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 운동 기록 (핵심 테이블)
CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL,          -- 'running', 'pullup', 등
  recorded_at   TIMESTAMPTZ NOT NULL,   -- 실제 운동 시각
  raw_input     TEXT,                   -- 사용자가 입력한 원문 (파싱 검증용)
  metrics       JSONB NOT NULL,         -- 종목별 자유 필드
  ai_confidence FLOAT,                  -- AI 파싱 신뢰도 (0~1)
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- AI 코칭 메시지 기록
CREATE TABLE coach_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  activity_id UUID REFERENCES activities,   -- 특정 운동에 대한 피드백이면 연결
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  ui_card     JSONB,                        -- 채팅창에 렌더링할 위젯 데이터
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 훈련 계획
CREATE TABLE training_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  goal_id       UUID REFERENCES goals,
  plan          JSONB NOT NULL,             -- 주간 단위 구조화된 훈련 계획
  valid_from    DATE NOT NULL,
  valid_until   DATE,
  generated_by  TEXT NOT NULL,             -- LLM provider 기록
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- 유저는 자신의 데이터만 조회/생성/수정/삭제 가능
CREATE POLICY "users can only access own data" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users can only access own data" ON activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users can only access own data" ON coach_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users can only access own data" ON training_plans FOR ALL USING (auth.uid() = user_id);

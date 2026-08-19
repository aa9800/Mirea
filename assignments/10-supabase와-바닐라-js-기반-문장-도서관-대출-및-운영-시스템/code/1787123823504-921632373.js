import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

if (SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
  // config.js를 아직 채우지 않은 경우 눈에 띄게 알려준다.
  console.warn(
    "[config.js] SUPABASE_URL / SUPABASE_ANON_KEY를 아직 설정하지 않았습니다."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 화면 상단에 에러 메시지를 띄우는 공용 헬퍼
export function showError(message) {
  const box = document.getElementById("error-box");
  if (!box) return;
  box.textContent = message;
  box.style.display = message ? "block" : "none";
}

export function fmtDate(d) {
  if (!d) return "-";
  return d;
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
}

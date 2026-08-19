import { supabase, showError } from "./supabaseClient.js";
const { data } = await supabase.auth.getSession();
if (data.session) location.replace(new URLSearchParams(location.search).get("next") || "admin.html");
if (new URLSearchParams(location.search).get("error") === "not_staff") {
  showError("운영자로 등록된 계정만 접근할 수 있습니다.");
}
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault(); showError("");
  const button = event.currentTarget.querySelector("button"); button.disabled = true; button.textContent = "확인 중...";
  const { error } = await supabase.auth.signInWithPassword({ email:document.getElementById("login-email").value.trim(), password:document.getElementById("login-password").value });
  if (error) { showError("이메일 또는 비밀번호를 확인해주세요."); button.disabled = false; button.textContent = "로그인"; return; }
  location.replace(new URLSearchParams(location.search).get("next") || "admin.html");
});

import { supabase, showError } from "./supabaseClient.js";
const form = document.getElementById("member-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");
  const success = document.getElementById("success-box");
  success.style.display = "none";
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim() || null;
  const button = form.querySelector("button"); button.disabled = true; button.textContent = "가입 처리 중...";
  const { error } = await supabase.from("members").insert({ name, email, phone });
  if (error) { showError(error.code === "23505" ? "이미 가입된 이메일입니다." : `가입 처리 중 문제가 생겼습니다: ${error.message}`); button.disabled = false; button.textContent = "가입 신청하기"; return; }
  form.reset();
  success.textContent = `${name}님, 문장 도서관 회원이 되신 것을 환영합니다.`;
  success.style.display = "block";
  button.disabled = false; button.textContent = "가입 신청하기";
});

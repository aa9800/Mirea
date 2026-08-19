import { supabase, showError, escapeHTML } from "./supabaseClient.js";
const tbody = document.getElementById("table-body");
async function load() {
  const { data, error } = await supabase.from("members").select("*").order("id", { ascending:false });
  if (error) { showError(`회원을 불러오지 못했습니다: ${error.message}`); return; }
  tbody.innerHTML = data.length ? data.map((member) => `<tr><td><span class="book-id">#${member.id}</span></td><td><strong>${escapeHTML(member.name)}</strong></td><td>${escapeHTML(member.email)}</td><td>${escapeHTML(member.phone ?? "—")}</td><td>${member.joined_at}</td><td><button class="danger" data-id="${member.id}">삭제</button></td></tr>`).join("") : `<tr class="empty-row"><td colspan="6">등록된 회원이 없습니다.</td></tr>`;
}
tbody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]"); if (!button || !confirm("이 회원과 관련 대출 기록을 삭제할까요?")) return;
  const { error } = await supabase.from("members").delete().eq("id", button.dataset.id);
  if (error) { showError(`삭제하지 못했습니다: ${error.message}`); return; } load();
});
load();

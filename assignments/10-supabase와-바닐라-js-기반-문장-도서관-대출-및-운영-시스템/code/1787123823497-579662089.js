import { supabase, showError, escapeHTML } from "./supabaseClient.js";

const form = document.getElementById("category-form");
const tbody = document.getElementById("table-body");

async function load() {
  showError("");
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    showError(`목록 조회 실패: ${error.message}`);
    return;
  }
  if (!data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">등록된 분류가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = data
    .map(
      (c) => `
    <tr>
      <td>${c.id}</td>
      <td>${escapeHTML(c.name)}</td>
      <td>${new Date(c.created_at).toLocaleDateString()}</td>
      <td><button class="danger" data-id="${c.id}">삭제</button></td>
    </tr>`
    )
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");
  const name = document.getElementById("name").value.trim();
  if (!name) return;

  const { error } = await supabase.from("categories").insert({ name });
  if (error) {
    showError(`추가 실패: ${error.message} (분류명이 중복되지 않았는지 확인하세요)`);
    return;
  }
  form.reset();
  load();
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  if (!confirm("이 분류를 삭제할까요? (해당 분류의 도서는 category_id가 NULL로 바뀝니다)")) return;
  const { error } = await supabase.from("categories").delete().eq("id", btn.dataset.id);
  if (error) {
    showError(`삭제 실패: ${error.message}`);
    return;
  }
  load();
});

load();

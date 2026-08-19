import { supabase, showError, escapeHTML } from "./supabaseClient.js";

const form = document.getElementById("author-form");
const tbody = document.getElementById("table-body");

async function load() {
  showError("");
  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    showError(`목록 조회 실패: ${error.message}`);
    return;
  }
  if (!data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">등록된 저자가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = data
    .map(
      (a) => `
    <tr>
      <td>${a.id}</td>
      <td>${escapeHTML(a.name)}</td>
      <td>${escapeHTML(a.bio ?? "-")}</td>
      <td>${new Date(a.created_at).toLocaleDateString()}</td>
      <td><button class="danger" data-id="${a.id}">삭제</button></td>
    </tr>`
    )
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");
  const name = document.getElementById("name").value.trim();
  const bio = document.getElementById("bio").value.trim() || null;
  if (!name) return;

  const { data: duplicate } = await supabase.from("authors").select("id").ilike("name", name).maybeSingle();
  if (duplicate) {
    showError("이미 등록된 저자입니다.");
    return;
  }
  const { error } = await supabase.from("authors").insert({ name, bio });
  if (error) {
    showError(`추가 실패: ${error.message}`);
    return;
  }
  form.reset();
  load();
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  if (!confirm("이 저자를 삭제할까요? (해당 저자의 도서는 author_id가 NULL로 바뀝니다)")) return;
  const { error } = await supabase.from("authors").delete().eq("id", btn.dataset.id);
  if (error) {
    showError(`삭제 실패: ${error.message}`);
    return;
  }
  load();
});

load();

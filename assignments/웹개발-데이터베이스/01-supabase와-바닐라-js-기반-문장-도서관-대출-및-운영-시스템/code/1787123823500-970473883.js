import { supabase, showError, escapeHTML } from "./supabaseClient.js";

const form = document.getElementById("loan-form");
const tbody = document.getElementById("table-body");
const bookSelect = document.getElementById("book_id");
const memberSelect = document.getElementById("member_id");
const loanDateInput = document.getElementById("loan_date");
const dueDateInput = document.getElementById("due_date");

function today() {
  return new Date().toISOString().slice(0, 10);
}
function plusDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

loanDateInput.value = today();
dueDateInput.value = plusDays(today(), 14);
loanDateInput.addEventListener("change", () => {
  dueDateInput.value = plusDays(loanDateInput.value, 14);
});

async function loadOptions() {
  const [{ data: books, error: e1 }, { data: members, error: e2 }] = await Promise.all([
    supabase.from("book_availability").select("*").order("title"),
    supabase.from("members").select("id, name, email").order("name"),
  ]);
  if (e1 || e2) {
    showError(`옵션 조회 실패: ${(e1 || e2).message}`);
    return;
  }
  bookSelect.innerHTML = books
    .map(
      (b) =>
        `<option value="${b.book_id}" ${b.available_copies <= 0 ? "disabled" : ""}>
          ${escapeHTML(b.title)} (대출가능 ${b.available_copies}/${b.total_copies})
        </option>`
    )
    .join("");
  memberSelect.innerHTML = members
    .map((m) => `<option value="${m.id}">${escapeHTML(m.name)} (${escapeHTML(m.email)})</option>`)
    .join("");
}

async function loadLoans() {
  showError("");
  const { data, error } = await supabase
    .from("loans")
    .select("*, books(title), members(name)")
    .order("id", { ascending: false });

  if (error) {
    showError(`목록 조회 실패: ${error.message}`);
    return;
  }
  if (!data.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">등록된 대출이 없습니다.</td></tr>`;
    return;
  }

  const todayStr = today();
  tbody.innerHTML = data
    .map((l) => {
      let status = `<span class="badge ok">대출중</span>`;
      if (l.return_date) {
        status = `<span class="badge muted">반납완료</span>`;
      } else if (l.due_date < todayStr) {
        status = `<span class="badge danger">연체</span>`;
      }
      const returnBtn = l.return_date
        ? ""
        : `<button data-id="${l.id}" data-action="return">반납 처리</button>`;
      return `
      <tr>
        <td>${l.id}</td>
        <td>${escapeHTML(l.books?.title ?? "-")}</td>
        <td>${escapeHTML(l.members?.name ?? "-")}</td>
        <td>${l.loan_date}</td>
        <td>${l.due_date}</td>
        <td>${l.return_date ?? "-"}</td>
        <td>${status}</td>
        <td style="display:flex; gap:6px;">
          ${returnBtn}
          <button class="danger" data-id="${l.id}" data-action="delete">삭제</button>
        </td>
      </tr>`;
    })
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("");
  const book_id = bookSelect.value;
  const member_id = memberSelect.value;
  const loan_date = loanDateInput.value;
  const due_date = dueDateInput.value;
  if (!book_id || !member_id) {
    showError("도서와 회원을 선택하세요.");
    return;
  }

  // 등록 직전에 다시 한 번 재고 확인 (동시 대출 대비)
  const { data: av, error: avErr } = await supabase
    .from("book_availability")
    .select("available_copies")
    .eq("book_id", book_id)
    .single();
  if (avErr) {
    showError(`재고 확인 실패: ${avErr.message}`);
    return;
  }
  if (av.available_copies <= 0) {
    showError("이 도서는 현재 대출 가능한 재고가 없습니다.");
    return;
  }

  const { error } = await supabase
    .from("loans")
    .insert({ book_id, member_id, loan_date, due_date });

  if (error) {
    showError(`대출 등록 실패: ${error.message}`);
    return;
  }
  loanDateInput.value = today();
  dueDateInput.value = plusDays(today(), 14);
  await Promise.all([loadOptions(), loadLoans()]);
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === "return") {
    const { error } = await supabase
      .from("loans")
      .update({ return_date: today() })
      .eq("id", id);
    if (error) {
      showError(`반납 처리 실패: ${error.message}`);
      return;
    }
  } else if (btn.dataset.action === "delete") {
    if (!confirm("이 대출 기록을 삭제할까요?")) return;
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) {
      showError(`삭제 실패: ${error.message}`);
      return;
    }
  }
  await Promise.all([loadOptions(), loadLoans()]);
});

loadOptions();
loadLoans();

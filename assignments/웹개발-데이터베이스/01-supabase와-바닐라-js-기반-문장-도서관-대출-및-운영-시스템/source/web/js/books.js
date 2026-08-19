import { supabase, showError, escapeHTML } from "./supabaseClient.js";

const tbody = document.getElementById("table-body");
const searchInput = document.getElementById("book-search");
const filterButtons = document.querySelectorAll(".filter-chip[data-filter]");
const resultCount = document.getElementById("result-count");
let books = [];
let availability = new Map();
let currentFilter = "all";

function render(rows) {
  resultCount.textContent = `${rows.length.toLocaleString("ko-KR")}권 표시`;
  tbody.innerHTML = rows.length ? rows.map((book) => {
    const available = Number(availability.get(book.id)?.available_copies ?? book.total_copies);
    const badgeClass = available <= 0 ? "danger" : available < book.total_copies ? "warn" : "ok";
    const label = available <= 0 ? "대출 중" : `${available}권 대출 가능`;
    return `<tr><td><span class="book-id">#${String(book.id).padStart(3,"0")}</span></td><td><span class="book-title">${escapeHTML(book.title)}</span></td><td>${escapeHTML(book.authors?.name ?? "미상")}</td><td>${escapeHTML(book.categories?.name ?? "미분류")}</td><td>${book.published_year ?? "—"}</td><td><span class="badge ${badgeClass}">${label}</span></td><td><button class="ghost borrow-guide" data-book-id="${book.id}">대출 안내</button></td></tr>`;
  }).join("") : `<tr class="empty-row"><td colspan="7">조건에 맞는 도서가 없습니다.</td></tr>`;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  render(books.filter((book) => {
    const available = Number(availability.get(book.id)?.available_copies ?? book.total_copies);
    const textMatch = [book.title, book.authors?.name, book.categories?.name].some((value) => value?.toLowerCase().includes(query));
    const stateMatch = currentFilter === "all" || (currentFilter === "available" && available === Number(book.total_copies)) || (currentFilter === "low" && available > 0 && available < Number(book.total_copies)) || (currentFilter === "out" && available <= 0);
    return textMatch && stateMatch;
  }));
}

async function load() {
  const [{ data: bookRows, error }, { data: stock }] = await Promise.all([
    supabase.from("books").select("*, authors(name), categories(name)").order("id", { ascending:false }),
    supabase.from("book_availability").select("*"),
  ]);
  if (error) { showError(`도서를 불러오지 못했습니다: ${error.message}`); return; }
  books = bookRows;
  availability = new Map((stock ?? []).map((row) => [row.book_id, row]));
  document.getElementById("book-count").textContent = books.length.toLocaleString("ko-KR");
  document.getElementById("available-count").textContent = books.reduce((sum, book) => sum + Number(availability.get(book.id)?.available_copies ?? book.total_copies), 0).toLocaleString("ko-KR");
  const requested = new URLSearchParams(location.search).get("q");
  const requestedFilter = new URLSearchParams(location.search).get("filter");
  if (requested) searchInput.value = requested;
  if (["all","available","low","out"].includes(requestedFilter)) {
    currentFilter = requestedFilter;
    filterButtons.forEach((item) => item.classList.toggle("active", item.dataset.filter === currentFilter));
  }
  applyFilters();
}

searchInput.addEventListener("input", applyFilters);
filterButtons.forEach((button) => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle("active", item === button));
  applyFilters();
}));
load();

const dialog = document.getElementById("loan-dialog");
tbody.addEventListener("click", (event) => {
  const button = event.target.closest(".borrow-guide"); if (!button) return;
  const book = books.find((item) => String(item.id) === button.dataset.bookId); const available = Number(availability.get(book.id)?.available_copies ?? book.total_copies);
  document.getElementById("dialog-book-title").textContent = book.title;
  document.getElementById("dialog-book-status").textContent = available > 0 ? `현재 ${available}권을 대출할 수 있습니다. 회원증을 지참해 도서관 데스크를 방문해주세요.` : "현재 모든 도서가 대출 중입니다. 반납 후 다시 이용해주세요.";
  dialog.showModal();
});
dialog.querySelectorAll(".dialog-close,.dialog-confirm").forEach((button) => button.addEventListener("click", () => dialog.close()));

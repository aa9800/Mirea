import { supabase, showError, escapeHTML } from "./supabaseClient.js";

const form = document.getElementById("manage-book-form");
const tableBody = document.getElementById("manage-book-body");
const authorSelect = document.getElementById("manage-author");
const categorySelect = document.getElementById("manage-category");

async function loadOptions() {
  const [{ data: authors, error: authorError }, { data: categories, error: categoryError }] =
    await Promise.all([
      supabase.from("authors").select("id, name").order("name"),
      supabase.from("categories").select("id, name").order("name"),
    ]);

  if (authorError || categoryError) {
    showError(`선택 항목을 불러오지 못했습니다: ${(authorError || categoryError).message}`);
    return;
  }

  authorSelect.innerHTML = `<option value="">저자 미상</option>` +
    authors.map((author) => `<option value="${author.id}">${escapeHTML(author.name)}</option>`).join("");
  categorySelect.innerHTML = `<option value="">미분류</option>` +
    categories.map((category) => `<option value="${category.id}">${escapeHTML(category.name)}</option>`).join("");
}

async function loadBooks() {
  const { data: books, error } = await supabase
    .from("books")
    .select("*, authors(name), categories(name)")
    .order("id", { ascending: false });

  if (error) {
    showError(`도서를 불러오지 못했습니다: ${error.message}`);
    return;
  }

  tableBody.innerHTML = books.length
    ? books.map((book) => `
      <tr>
        <td><span class="book-title">${escapeHTML(book.title)}</span></td>
        <td>${escapeHTML(book.authors?.name ?? "미상")}</td>
        <td>${escapeHTML(book.categories?.name ?? "미분류")}</td>
        <td>${book.published_year ?? "—"}</td>
        <td>${book.total_copies}권</td>
        <td><button class="danger" data-id="${book.id}">삭제</button></td>
      </tr>`).join("")
    : `<tr class="empty-row"><td colspan="6">등록된 도서가 없습니다.</td></tr>`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");

  const title = document.getElementById("manage-title").value.trim();
  const isbn = document.getElementById("manage-isbn").value.trim() || null;
  const authorId = authorSelect.value || null;
  const categoryId = categorySelect.value || null;

  const duplicateQuery = supabase.from("books").select("id").ilike("title", title);
  const { data: sameTitleBooks } = authorId
    ? await duplicateQuery.eq("author_id", authorId)
    : await duplicateQuery.is("author_id", null);

  if (sameTitleBooks?.length) {
    showError("같은 제목과 저자의 도서가 이미 등록되어 있습니다.");
    return;
  }

  const { error } = await supabase.from("books").insert({
    title,
    isbn,
    author_id: authorId,
    category_id: categoryId,
    published_year: document.getElementById("manage-year").value || null,
    total_copies: Number(document.getElementById("manage-copies").value),
  });

  if (error) {
    showError(`등록하지 못했습니다: ${error.message}`);
    return;
  }

  form.reset();
  document.getElementById("manage-copies").value = 1;
  loadBooks();
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button || !confirm("이 도서를 삭제할까요? 관련 대출 기록도 함께 삭제됩니다.")) return;

  const { error } = await supabase.from("books").delete().eq("id", button.dataset.id);
  if (error) {
    showError(`삭제하지 못했습니다: ${error.message}`);
    return;
  }
  loadBooks();
});

loadOptions();
loadBooks();

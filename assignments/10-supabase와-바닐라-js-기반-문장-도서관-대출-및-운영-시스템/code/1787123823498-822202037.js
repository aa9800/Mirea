import { supabase, showError, escapeHTML } from "./supabaseClient.js";

const sentences = [
  { quote:"좋은 문장은 마음속에 작은 방 하나를 만든다.", theme:"천천히 머무는 독서", query:"에세이" },
  { quote:"멀리 가는 사람은 자주 자신의 마음을 펼쳐 본다.", theme:"새로운 세계를 향한 마음", query:"세계문학" },
  { quote:"우리가 서로를 이해하려는 순간, 이야기는 시작된다.", theme:"사람과 사람 사이의 이야기", query:"한국문학" },
  { quote:"질문 하나가 어제와 다른 세계의 문을 연다.", theme:"생각을 넓히는 발견", query:"인문" },
  { quote:"상상력은 아직 오지 않은 내일을 먼저 비춘다.", theme:"미래를 그리는 이야기", query:"SF" },
  { quote:"조용히 읽은 한 페이지가 오래 삶을 움직인다.", theme:"일상을 바꾸는 작은 시작", query:"자기계발" },
];
const sentence = sentences[Math.floor(Date.now()/86400000) % sentences.length];
document.getElementById("daily-quote").textContent = sentence.quote;
document.getElementById("daily-theme").textContent = `${sentence.theme} · 문장 도서관`;
document.getElementById("quote-books-link").href = `books.html?q=${encodeURIComponent(sentence.query)}`;

async function loadHome() {
  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("id, title, published_year, authors(name), categories(name)")
    .order("created_at", { ascending: false })
    .limit(4);

  if (booksError) {
    showError(`도서관 정보를 불러오지 못했습니다: ${booksError.message}`);
    document.getElementById("featured-books").innerHTML = `<div class="loading-card">새로 들어온 책을 잠시 불러오지 못했습니다.</div>`;
    return;
  }

  const palette = ["sage", "sand", "clay", "ink"];
  document.getElementById("featured-books").innerHTML = books.map((book, index) => `
    <a class="featured-book" href="books.html?q=${encodeURIComponent(book.title)}" aria-label="${escapeHTML(book.title)} 도서 보기">
      <div class="book-cover ${palette[index % palette.length]}">
        <span>${escapeHTML(book.categories?.name ?? "문장 도서관")}</span><strong>${escapeHTML(book.title)}</strong><small>MUNJANG LIBRARY</small>
      </div>
      <div class="featured-meta"><strong>${escapeHTML(book.title)}</strong><span>${escapeHTML(book.authors?.name ?? "작자 미상")} · ${book.published_year ?? "연도 미상"}</span></div>
    </a>
  `).join("");
}

loadHome();

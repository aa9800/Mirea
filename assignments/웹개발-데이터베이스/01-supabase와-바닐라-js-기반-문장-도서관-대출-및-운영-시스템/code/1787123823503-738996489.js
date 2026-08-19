// 모든 페이지 공통 상단 네비게이션
const LINKS = [
  { href: "index.html", label: "홈" },
  { href: "books.html", label: "도서" },
  { href: "members.html", label: "회원가입" },
];

export function renderNav() {
  const mount = document.getElementById("topnav");
  if (!mount) return;
  const current = (location.pathname.split("/").pop() || "index").replace(".html", "");
  mount.innerHTML = `
    <a class="brand" href="index.html" aria-label="문장 도서관 홈">
      <span class="brand-wordmark"><strong>문장 도서관</strong><small>MUNJANG LIBRARY</small></span><i>✦</i>
    </a>
    <nav>
      ${LINKS.map(
        (l) =>
          `<a href="${l.href}" class="${l.href.replace(".html", "") === current ? "active" : ""}">${l.label}</a>`
      ).join("")}
    </nav>
    <a class="header-cta" href="books.html"><span>도서 검색</span><b>⌕</b></a>
  `;
  const staffPages = ["admin", "manage-books", "manage-members", "authors", "categories", "loans"];
  if (!staffPages.includes(current) && current !== "login") {
    document.body.insertAdjacentHTML("beforeend", `<footer class="site-footer"><span>© 문장 도서관</span><a href="login.html">직원 로그인</a></footer>`);
  }
}

renderNav();

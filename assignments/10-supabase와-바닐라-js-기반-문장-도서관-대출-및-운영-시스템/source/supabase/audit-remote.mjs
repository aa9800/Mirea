import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../web/js/config.js";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

async function read(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : [] };
}

const [authors, categories, books, members, overdue] = await Promise.all([
  read("authors?select=id,name"),
  read("categories?select=id,name"),
  read("books?select=id,title,author_id,isbn"),
  read("members?select=id&limit=1"),
  read("overdue_loans?select=loan_id&limit=1"),
]);

function duplicateGroups(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = key(row);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1);
}

console.log({
  counts: {
    authors: authors.data.length,
    categories: categories.data.length,
    books: books.data.length,
  },
  duplicateAuthors: duplicateGroups(authors.data, (row) => row.name.trim().toLowerCase()),
  duplicateBooks: duplicateGroups(books.data, (row) => `${row.title.trim().toLowerCase()}::${row.author_id ?? 0}`),
  categoryNames: categories.data.map((row) => row.name),
  anonymousAccess: {
    members: members.status,
    overdueLoans: overdue.status,
  },
});

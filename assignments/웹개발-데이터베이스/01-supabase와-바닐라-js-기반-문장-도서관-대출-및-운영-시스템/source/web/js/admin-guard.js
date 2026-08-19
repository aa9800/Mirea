import { supabase } from "./supabaseClient.js";
const { data } = await supabase.auth.getSession();
if (!data.session) {
  location.replace(`login.html?next=${encodeURIComponent(location.pathname.split("/").pop() || "admin.html")}`);
} else {
  const { data: staff, error } = await supabase
    .from("staff_users")
    .select("user_id")
    .eq("user_id", data.session.user.id)
    .maybeSingle();
  if (error || !staff) {
    await supabase.auth.signOut();
    location.replace("login.html?error=not_staff");
    throw new Error("운영자 권한이 없는 계정입니다.");
  }
  document.body.classList.remove("auth-pending");
  const nav = document.querySelector("#topnav nav");
  if (nav) {
    const logout = document.createElement("button"); logout.className = "logout-button"; logout.textContent = "로그아웃";
    logout.addEventListener("click", async () => { await supabase.auth.signOut(); location.replace("index.html"); });
    nav.append(logout);
  }
}

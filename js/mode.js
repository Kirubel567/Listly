const themeToggle = document.querySelector(".fa-moon"); 
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.classList.replace("fa-moon", "fa-sun");
  }
}
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  
  // Switch icons
  if (isDark) {
    themeToggle.classList.replace("fa-moon", "fa-sun");
  } else {
    themeToggle.classList.replace("fa-sun", "fa-moon");
  }
});

document.addEventListener("DOMContentLoaded", initTheme);
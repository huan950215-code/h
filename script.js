document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

document.querySelector(".search-panel").addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = event.currentTarget.querySelector("input").value.trim();
  if (keyword) {
    document.querySelector("#goods").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

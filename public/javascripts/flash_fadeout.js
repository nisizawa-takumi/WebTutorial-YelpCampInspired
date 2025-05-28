window.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".flash-fadeout").forEach((flash) => {
    setTimeout(() => {
      flash.classList.remove("show");
      flash.classList.add("fade");
      setTimeout(() => flash.remove(), 500);
    }, 1500);
  });
});

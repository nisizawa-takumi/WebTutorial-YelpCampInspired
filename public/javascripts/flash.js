window.addEventListener("DOMContentLoaded", function () {
  // .flash-messageにtransitionを追加
  const style = document.createElement("style");
  style.textContent = `
      .flash-message {
        transition: opacity 0.7s;
      }
    `;
  document.head.appendChild(style);

  document.querySelectorAll(".flash-message").forEach((flash) => {
    setTimeout(() => {
      flash.classList.remove("show");
      flash.classList.add("fade");
      setTimeout(() => flash.remove(), 500);
    }, 1000);
  });
});

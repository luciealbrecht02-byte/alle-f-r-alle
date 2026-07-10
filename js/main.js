document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  const logo = document.querySelector(".logo-img");
  const pageContent = document.querySelector(".page-content");
  const header = document.querySelector(".site-header");

  if (logo && pageContent) {
    const alignContentLeft = () => {
      document.documentElement.style.setProperty(
        "--content-left",
        logo.getBoundingClientRect().right + "px"
      );
    };

    alignContentLeft();
    window.addEventListener("resize", alignContentLeft);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(alignContentLeft);
    }
  }

  if (header) {
    const setMenuHeight = () => {
      document.documentElement.style.setProperty(
        "--menu-height",
        header.offsetHeight + "px"
      );
    };

    setMenuHeight();
    window.addEventListener("resize", setMenuHeight);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setMenuHeight);
    }
  }
});

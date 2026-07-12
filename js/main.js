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

  const forschungImage = document.querySelector(
    "#forschung-screen-1 .forschung-room-image"
  );
  const forschungText = document.querySelector(
    "#forschung-screen-1 .problem-text"
  );

  if (forschungImage && forschungText) {
    const alignForschungImage = () => {
      const copy = forschungText.closest(".problem-copy");
      if (!copy) return;
      const offset =
        forschungText.getBoundingClientRect().top -
        copy.getBoundingClientRect().top;
      forschungImage.style.marginTop = offset + "px";
    };

    alignForschungImage();
    window.addEventListener("resize", alignForschungImage);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(alignForschungImage);
    }
  }

  const forschungScreen3Image = document.querySelector(
    "#forschung-screen-3 .forschung-room-image"
  );
  const forschungScreen3Text = document.querySelector(
    "#forschung-screen-3 .problem-text"
  );

  if (forschungScreen3Image && forschungScreen3Text) {
    const alignForschungScreen3Text = () => {
      const copy = forschungScreen3Text.closest(".problem-copy");
      if (!copy) return;
      // Vor der Messung zurücksetzen, damit sich der Versatz bei
      // wiederholten Aufrufen (Resize, Font-Load) nicht aufsummiert.
      copy.style.transform = "";
      const offset =
        forschungScreen3Image.getBoundingClientRect().top -
        forschungScreen3Text.getBoundingClientRect().top;
      copy.style.transform = `translateY(${offset}px)`;
    };

    alignForschungScreen3Text();
    window.addEventListener("resize", alignForschungScreen3Text);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(alignForschungScreen3Text);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".konzept-sections .editorial-section");
  const slides = document.querySelectorAll(".konzept-visual-slide");

  if (!sections.length || !slides.length) return;

  const setActive = (id) => {
    slides.forEach((slide) => {
      const targets = slide.dataset.for.split(" ");
      slide.classList.toggle("is-active", targets.includes(id));
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
});

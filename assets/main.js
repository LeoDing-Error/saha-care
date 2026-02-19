// Intersection observer for scroll-triggered fade-ins on blocks
const blocks = document.querySelectorAll('.block, .block-full');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

blocks.forEach(b => {
  b.style.opacity = '0';
  b.style.transform = 'translateY(24px)';
  b.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  obs.observe(b);
});

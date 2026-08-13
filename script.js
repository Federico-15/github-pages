const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const navbar = document.querySelector('.navbar');

const closeMenu = () => {
    if (!hamburger || !navMenu) return;

    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', '메뉴 열기');
};

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';

        hamburger.classList.toggle('active', !isOpen);
        navMenu.classList.toggle('active', !isOpen);
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        hamburger.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        event.preventDefault();
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
            top: targetTop,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });

        closeMenu();
    });
});

const updateNavigation = () => {
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }

    let currentSection = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentSection = section.id;
        }
    });

    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentSection}`;
        link.classList.toggle('active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
};

let scrollFrame;
window.addEventListener('scroll', () => {
    if (scrollFrame) return;

    scrollFrame = window.requestAnimationFrame(() => {
        updateNavigation();
        scrollFrame = null;
    });
}, { passive: true });

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
});

updateNavigation();

const previewTriggers = document.querySelectorAll('.project-image--preview');

if (previewTriggers.length) {
    const preview = document.createElement('div');
    preview.className = 'architecture-preview';
    preview.setAttribute('aria-hidden', 'true');
    preview.innerHTML = `
        <div class="architecture-preview__panel">
            <p class="architecture-preview__title"></p>
            <span class="architecture-preview__hint">마우스를 떼거나 Esc로 닫기</span>
            <img class="architecture-preview__image" alt="">
        </div>
    `;
    document.body.appendChild(preview);

    const previewImage = preview.querySelector('.architecture-preview__image');
    const previewTitle = preview.querySelector('.architecture-preview__title');
    let activeTrigger = null;
    let previewLocked = false;

    const showPreview = (trigger) => {
        const sourceImage = trigger.querySelector('.project-cover');
        if (!sourceImage) return;

        if (activeTrigger && activeTrigger !== trigger) {
            activeTrigger.setAttribute('aria-expanded', 'false');
        }

        activeTrigger = trigger;
        previewImage.src = sourceImage.currentSrc || sourceImage.src;
        previewImage.alt = sourceImage.alt;
        previewTitle.textContent = trigger.dataset.previewTitle || sourceImage.alt;
        preview.classList.add('is-active');
        preview.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
    };

    const hidePreview = () => {
        if (activeTrigger) {
            activeTrigger.setAttribute('aria-expanded', 'false');
        }

        activeTrigger = null;
        preview.classList.remove('is-active');
        preview.setAttribute('aria-hidden', 'true');
    };

    previewTriggers.forEach((trigger) => {
        trigger.addEventListener('mouseenter', () => showPreview(trigger));
        trigger.addEventListener('mouseleave', () => {
            if (!previewLocked && document.activeElement !== trigger) hidePreview();
        });
        trigger.addEventListener('focus', () => showPreview(trigger));
        trigger.addEventListener('blur', () => {
            if (!previewLocked) hidePreview();
        });
        trigger.addEventListener('click', () => {
            if (previewLocked && activeTrigger === trigger) {
                previewLocked = false;
                hidePreview();
                return;
            }

            previewLocked = true;
            showPreview(trigger);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeTrigger) {
            previewLocked = false;
            hidePreview();
        }
    });

    window.addEventListener('scroll', () => {
        if (!previewLocked && activeTrigger) hidePreview();
    }, { passive: true });
}

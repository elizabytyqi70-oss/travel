/**
 * TRAVELWISE -- JavaScript
 * Vecori unike: floating particles, parallax, ripple, planner, confetti, tilt, quotes
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initAOS();
    initChecklist();
    initFloatingParticles();
    initRippleEffect();
    initTiltCards();
    initQuotes();
    initPlanner();
    initBudgetCalc();
    initConfetti();
    initDidYouKnow();
});

/* ========== NAVBAR SCROLL ========== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let ticking = false;
    const updateNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateNavbar); ticking = true; }
    }, { passive: true });
}

/* ========== MENU MOBILE ========== */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

/* ========== SMOOTH SCROLL ========== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            const navHeight = document.getElementById('navbar')?.offsetHeight || 72;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - navHeight,
                behavior: 'smooth'
            });
        });
    });
}

/* ========== AOS ========== */
function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = Array.from(elements).indexOf(entry.target) % 4 * 100;
                setTimeout(() => entry.target.classList.add('aos-visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    elements.forEach(el => observer.observe(el));
}

/* ========== CHECKLIST ========== */
function initChecklist() {
    const allCheckboxes = document.querySelectorAll('.check-input');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    if (!allCheckboxes.length) return;

    const savedState = loadChecklistState();
    allCheckboxes.forEach(checkbox => {
        const uniqueId = getCheckboxId(checkbox);
        if (savedState[uniqueId]) checkbox.checked = true;
        checkbox.addEventListener('change', () => {
            saveChecklistState();
            updateProgress();
        });
    });

    addResetButton();
    updateProgress();

    function getCheckboxId(checkbox) {
        const text = checkbox.closest('.checklist-item')?.querySelector('.check-text')?.textContent || '';
        return text.substring(0, 40).trim().toLowerCase().replace(/\s+/g, '-');
    }
    function loadChecklistState() {
        try { return JSON.parse(localStorage.getItem('travelwise-checklist') || '{}'); }
        catch { return {}; }
    }
    function saveChecklistState() {
        const state = {};
        allCheckboxes.forEach(cb => { const id = getCheckboxId(cb); if (cb.checked) state[id] = true; });
        try { localStorage.setItem('travelwise-checklist', JSON.stringify(state)); }
        catch {}
    }
    function updateProgress() {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.check-input:checked').length;
        const pct = Math.round((checked / total) * 100);
        if (progressFill) progressFill.style.width = pct + '%';
        if (progressPercent) {
            progressPercent.textContent = pct + '%';
            progressPercent.style.color = pct === 100 ? 'var(--success)' : pct >= 50 ? 'var(--teal)' : 'var(--accent)';
        }
        const pc = document.getElementById('progressChecked');
        const pt = document.getElementById('progressTotal');
        if (pc) pc.textContent = checked;
        if (pt) pt.textContent = total;
        if (pct === 100) launchConfetti();
    }
    function addResetButton() {
        const progressDiv = document.querySelector('.checklist-progress');
        if (!progressDiv) return;
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Rivendos Listën';
        resetBtn.className = 'btn-reset-checklist';
        Object.assign(resetBtn.style, {
            marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'transparent',
            border: '1.5px solid var(--border-dark)', color: 'var(--text-muted)',
            fontSize: '0.85rem', fontWeight: '500', borderRadius: 'var(--radius-full)',
            cursor: 'pointer', transition: 'all var(--transition-fast)', fontFamily: 'var(--font-body)'
        });
        resetBtn.addEventListener('mouseenter', () => { resetBtn.style.borderColor = 'var(--danger)'; resetBtn.style.color = 'var(--danger)'; });
        resetBtn.addEventListener('mouseleave', () => { resetBtn.style.borderColor = 'var(--border-dark)'; resetBtn.style.color = 'var(--text-muted)'; });
        resetBtn.addEventListener('click', () => {
            if (confirm('A je i sigurt që dëshiron të rivendosësh të gjithë listën?')) {
                allCheckboxes.forEach(cb => cb.checked = false);
                saveChecklistState();
                updateProgress();
            }
        });
        progressDiv.appendChild(resetBtn);
    }
}

/* ========== FLOATING PARTICLES + PARALLAX ========== */
function initFloatingParticles() {
    const container = document.getElementById('floatingParticles');
    if (!container) return;

    const emojis = ['✈️', '🌍', '🧳', '🗺️', '🧭', '🏝️', '⛰️', '🎒'];
    emojis.forEach(emoji => {
        const particle = document.createElement('span');
        particle.className = 'float-particle';
        particle.textContent = emoji;
        container.appendChild(particle);
    });

    // Parallax me mouse
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        const particles = container.querySelectorAll('.float-particle');
        particles.forEach((p, i) => {
            const factor = (i + 1) * 0.3;
            p.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });
}

/* ========== RIPPLE EFFECT ========== */
function initRippleEffect() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.classList.add('btn-ripple');
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
}

/* ========== CARD TILT ========== */
function initTiltCards() {
    document.querySelectorAll('.essential-card, .overview-card, .resp-card, .rule-card').forEach(card => {
        card.classList.add('tilt-card');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 3}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
        });
    });
    document.querySelectorAll('.overview-card, .essential-card, .resp-card').forEach(card => {
        card.classList.add('glow-on-hover');
    });
}

/* ========== CITATE UDHËTIMI ========== */
function initQuotes() {
    const quotes = [
        { text: 'Udhëtimi është e vetmja gjë që blen dhe të bën më të pasur.', author: '— Proverb i Vjetër' },
        { text: 'Bota është një libër, dhe ata që nuk udhëtojnë lexojnë vetëm një faqe.', author: '— Shën Agustini' },
        { text: 'Një mijë milje udhëtim fillojnë me një hap të vetëm.', author: '— Lao Tzu' },
        { text: 'Jo të gjithë ata që enden janë të humbur.', author: '— J.R.R. Tolkien' },
        { text: 'Udhëtimi të lë pa fjalë, pastaj të kthen në një tregimtar.', author: '— Ibn Batuta' },
        { text: 'Jeta është ose një aventurë e guximshme, ose asgjë.', author: '— Helen Keller' }
    ];

    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const dotsContainer = document.getElementById('quoteDots');
    if (!quoteText || !quoteAuthor) return;

    let current = 0;
    let interval;

    function showQuote(index) {
        current = index;
        quoteText.style.opacity = '0';
        quoteAuthor.style.opacity = '0';
        setTimeout(() => {
            quoteText.textContent = quotes[index].text;
            quoteAuthor.textContent = quotes[index].author;
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
        }, 300);
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.quote-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
        }
    }

    quoteText.style.transition = 'opacity 0.3s ease';
    quoteAuthor.style.transition = 'opacity 0.3s ease';

    function nextQuote() {
        showQuote((current + 1) % quotes.length);
    }

    interval = setInterval(nextQuote, 6000);

    // Click dots
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            const dot = e.target.closest('.quote-dot');
            if (!dot) return;
            const idx = parseInt(dot.dataset.index);
            showQuote(idx);
            clearInterval(interval);
            interval = setInterval(nextQuote, 6000);
        });
    }

    showQuote(0);
}

/* ========== TRIP QUICK PLANNER ========== */
function initPlanner() {
    const form = document.getElementById('plannerForm');
    const result = document.getElementById('plannerResult');
    if (!form || !result) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runPlanner();
    });
    
    // Fallback: klikim direkt në buton
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            runPlanner();
        });
    }

    function runPlanner() {
        const destination = document.getElementById('destInput')?.value || 'Destinacioni';
        const days = parseInt(document.getElementById('daysInput')?.value) || 5;
        const type = document.getElementById('typeSelect')?.value || 'plesant';

        const budgets = { ekonomik: 40, mesatar: 90, luksoz: 200, aventur: 35, plesant: 70 };
        const daily = budgets[type] || 70;
        const totalBudget = daily * days;
        
        const visaDays = type === 'luksoz' ? 'Nuk nevojitet vizë për shumicën e destinacioneve luksoze' : 
                          'Kontrollo vizën në ambasadë — apliko 4 javë para';
        const clothes = type === 'plesant' ? 'Rroba plazhi, sandale, krem dielli SPF 50+' :
                        type === 'aventur' ? 'Këpucë hiking, xhaketë kundër shiut, çantë shpine' :
                        type === 'luksoz' ? 'Veshje elegante, kostum/fustan mbrëmjeje' :
                        'Veshje të rehatshme, shtresa për çdo mot';

        document.getElementById('rBudget').textContent = totalBudget + '€';
        document.getElementById('rVisa').textContent = visaDays;
        document.getElementById('rClothes').textContent = clothes;
        document.getElementById('rDays').textContent = days + ' ditë';

        result.classList.add('show');
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/* ========== BUDGET CALCULATOR ========== */
function initBudgetCalc() {
    const sliders = document.querySelectorAll('.calc-slider');
    const totalEl = document.getElementById('calcTotal');
    if (!sliders.length || !totalEl) return;

    function updateTotal() {
        let total = 0;
        sliders.forEach(s => {
            const val = parseInt(s.value);
            const display = document.getElementById(s.dataset.display);
            if (display) display.textContent = val + '€';
            total += val;
        });
        totalEl.textContent = total + '€';
    }

    sliders.forEach(s => s.addEventListener('input', updateTotal));
    updateTotal();
}

/* ========== CONFETTI ========== */
let confettiLaunched = false;
function launchConfetti() {
    if (confettiLaunched) return;
    confettiLaunched = true;

    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#C87A4A', '#3D7A7A', '#4A9C6C', '#E6A23C', '#D9534F', '#F5E1D0', '#E8F3F3'];
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(piece);
    }

    setTimeout(() => { container.remove(); confettiLaunched = false; }, 4000);
}
function initConfetti() {} // Placeholder — activated on 100% checklist

/* ========== "A E DINI SE?" ========== */
function initDidYouKnow() {
    const el = document.getElementById('dykText');
    if (!el) return;

    const facts = [
        'Ishte <strong>aeroplani</strong> i parë tregtar që transportoi pasagjerë në vitin <strong>1914</strong> — fluturimi zgjati vetëm 23 minuta.',
        'Vendi më i vizituar në botë është <strong>Franca</strong> me mbi <strong>89 milion</strong> turistë në vit.',
        'Pasaporta më e fuqishme në botë i përket <strong>Singaporit</strong> — qytetarët e saj udhëtojnë pa vizë në 195 shtete.',
        'Aeroporti më i ngarkuar në botë është <strong>Atlanta Hartsfield-Jackson</strong> me mbi 107 milion pasagjerë në vit.',
        'Fshati më i vogël në botë është <strong>Hum</strong> në Kroaci — ka vetëm 30 banorë.',
        'Liqeni më i thellë në botë është <strong>Liqeni Baikal</strong> në Rusi — thellësia arrin 1,642 metra.',
        'Shtegu më i gjatë i ecjes në botë është <strong>Great Trail</strong> në Kanada — 24,000 km.',
        'Stacioni më i lartë hekurudhor në Evropë është <strong>Jungfraujoch</strong> në Zvicër — 3,454 metra mbi nivelin e detit.',
        'Hendeku më i thellë oqeanik është <strong>Mariana Trench</strong> — 11,034 metra thellësi.',
        'Shkretëtira më e madhe e nxehtë në botë është <strong>Sahara</strong> — 9.2 milion km².'
    ];

    let current = 0;
    el.style.transition = 'opacity 0.4s ease';

    function showFact() {
        el.style.opacity = '0';
        setTimeout(() => {
            el.innerHTML = '💡 ' + facts[current];
            el.style.opacity = '1';
            current = (current + 1) % facts.length;
        }, 400);
    }

    showFact();
    setInterval(showFact, 5000);
}

/* ============================================================
   FITNESSBOOK — SCRIPT PRINCIPAL
   Versión reforzada y organizada por módulos
   ============================================================ */

'use strict';

/* ============================================================
   1. UTILIDADES GENERALES
   ============================================================ */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   2. TEST PERSONALIZADO
   ============================================================ */

const TestModule = (() => {

    /* --- Referencias DOM --- */
    const title        = $('#questionTitle');
    const container    = $('#answersContainer');
    const step         = $('#stepText');
    const progress     = $('#progressFill');
    const prevBtn      = $('#prevBtn');
    const nextBtn      = $('#nextBtn');
    const resultBox    = $('#resultBox');
    const recommendedBook = $('#recommendedBook');
    const recommendedText = $('#recommendedText');
    const testContainer   = $('.test-container');

    /* --- Preguntas --- */
    const questions = [
        {
            question: '¿Cuál es tu objetivo?',
            answers : ['Perder grasa', 'Ganar músculo', 'Mantener', 'Rendimiento'],
            type    : 'goal'
        },
        {
            question: '¿Cuántos días entrenas?',
            answers : ['0-2 días', '3-4 días', '5+ días'],
            type    : 'days'
        },
        {
            question: '¿Cuál es tu nivel?',
            answers : ['Principiante', 'Intermedio', 'Avanzado'],
            type    : 'level'
        },
        {
            question: '¿Qué buscas?',
            answers : ['Nutrición', 'Entrenamiento', 'Ambos'],
            type    : 'need'
        },
        {
            question: '¿Cómo prefieres progresar?',
            answers : ['Rápido', 'Poco a poco'],
            type    : 'speed'
        }
    ];

    /* --- Estado --- */
    const STORAGE_KEY = 'fitnessbook_test_answers';
    let currentQuestion = 0;
    let answers = loadAnswers();

    /* --- Persistencia --- */
    function loadAnswers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    function saveAnswers() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        } catch { /* modo privado, ignorar */ }
    }

    function clearAnswers() {
        answers = {};
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }

    /* --- Render --- */
    function loadQuestion() {
        const q = questions[currentQuestion];

        title.textContent = q.question;
        container.innerHTML = '';

        step.textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
        progress.style.width =
            ((currentQuestion + 1) / questions.length) * 100 + '%';

        q.answers.forEach(answer => {
            const div = document.createElement('button');
            div.type = 'button';
            div.className = 'answer';
            div.textContent = answer;
            div.setAttribute('role', 'radio');
            div.setAttribute('aria-checked', answers[q.type] === answer);

            if (answers[q.type] === answer) {
                div.classList.add('selected');
            }

            div.addEventListener('click', () => selectAnswer(q.type, answer, div));
            container.appendChild(div);
        });

        prevBtn.disabled = currentQuestion === 0;
        nextBtn.textContent =
            currentQuestion === questions.length - 1
                ? 'Ver resultado'
                : 'Siguiente';
    }

    function selectAnswer(type, value, el) {
        $$('.answer', container).forEach(a => {
            a.classList.remove('selected');
            a.setAttribute('aria-checked', 'false');
        });
        el.classList.add('selected');
        el.setAttribute('aria-checked', 'true');
        answers[type] = value;
        saveAnswers();
    }

    /* --- Navegación --- */
    function goNext() {
        const type = questions[currentQuestion].type;

        if (!answers[type]) {
            showInlineWarning('Selecciona una opción para continuar');
            return;
        }

        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            loadQuestion();
        } else {
            finishTest();
        }
    }

    function goPrev() {
        if (currentQuestion > 0) {
            currentQuestion--;
            loadQuestion();
        }
    }

    /* --- Aviso visual (en lugar de alert) --- */
    function showInlineWarning(msg) {
        let warn = $('#testWarning');
        if (!warn) {
            warn = document.createElement('p');
            warn.id = 'testWarning';
            warn.style.cssText =
                'color:#d32f2f;font-weight:600;margin-top:12px;text-align:center;';
            testContainer.appendChild(warn);
        }
        warn.textContent = '⚠️ ' + msg;
        clearTimeout(warn._t);
        warn._t = setTimeout(() => warn.remove(), 2500);
    }

    /* --- Resultado --- */
    function finishTest() {
        testContainer.style.display = 'none';
        resultBox.style.display = 'block';

        recommendedBook.textContent = 'Calculando...';
        recommendedText.textContent = '';

        setTimeout(() => {
            const rec = getRecommendation(answers);
            recommendedBook.textContent = rec.title;
            recommendedText.textContent = rec.text;
        }, 600);
    }

    /* --- Lógica de recomendación usando TODAS las respuestas --- */
    function getRecommendation(a) {
        const base = {
            'Perder grasa': {
                title: '🔥 Cuadernillo Definición',
                text : 'Nuestro cuadernillo de definición está pensado para ayudarte a perder grasa sin perder músculo mediante una alimentación equilibrada y una rutina eficaz.'
            },
            'Ganar músculo': {
                title: '💪 Cuadernillo Volumen',
                text : 'Aprende a ganar masa muscular con un superávit bien estructurado y una planificación de entrenamiento progresiva.'
            },
            'Mantener': {
                title: '⚖️ Cuadernillo Mantenimiento',
                text : 'Ideal para mantener tu físico todo el año sin dietas estrictas.'
            },
            'Rendimiento': {
                title: '🏃 Cuadernillo Rendimiento',
                text : 'Optimiza tu alimentación y entrenamiento para mejorar tu rendimiento deportivo.'
            }
        };

        const rec = { ...base[a.goal] };

        /* Matices según el resto de respuestas */
        const extras = [];

        if (a.level === 'Principiante') {
            extras.push('Incluye una introducción paso a paso ideal para empezar.');
        }
        if (a.level === 'Avanzado') {
            extras.push('Con ajustes avanzados para exprimir cada fase.');
        }
        if (a.days === '0-2 días') {
            extras.push('Rutinas adaptadas a pocos días de entrenamiento.');
        }
        if (a.days === '5+ días') {
            extras.push('Con planificación para semanas de alta frecuencia.');
        }
        if (a.need === 'Nutrición') {
            extras.push('Enfocado especialmente en la parte nutricional.');
        }
        if (a.need === 'Entrenamiento') {
            extras.push('Con más peso en la parte de entrenamiento.');
        }
        if (a.speed === 'Rápido') {
            extras.push('Con estrategias para ver resultados cuanto antes.');
        }
        if (a.speed === 'Poco a poco') {
            extras.push('Pensado para progresar de forma sostenible.');
        }

        if (extras.length) {
            rec.text += ' ' + extras.join(' ');
        }

        return rec;
    }

    /* --- Reinicio --- */
    function restart() {
        clearAnswers();
        currentQuestion = 0;
        testContainer.style.display = '';
        resultBox.style.display = 'none';
        loadQuestion();
        testContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* --- Init --- */
    function init() {
        if (!title || !container) return; // no estamos en la página del test

        loadQuestion();
        nextBtn.addEventListener('click', goNext);
        prevBtn.addEventListener('click', goPrev);

        /* Botón "Repetir test" (creado dinámicamente si no existe) */
        let restartBtn = $('#restartTest');
        if (!restartBtn) {
            restartBtn = document.createElement('button');
            restartBtn.id = 'restartTest';
            restartBtn.type = 'button';
            restartBtn.className = 'btn-white';
            restartBtn.textContent = '↻ Repetir test';
            restartBtn.style.marginTop = '25px';
            resultBox.appendChild(restartBtn);
        }
        restartBtn.addEventListener('click', restart);
    }

    return { init };
})();

/* ============================================================
   3. CALCULADORA IMC
   ============================================================ */

const IMCModule = (() => {

    const heightInput = $('#height');
    const weightInput = $('#weight');
    const imcButton   = $('#calculateIMC');
    const imcResult   = $('#imcResult');

    if (!imcButton || !heightInput || !weightInput || !imcResult) return { init() {} };

    /* --- Clasificación --- */
    const CATEGORIES = [
        { max: 18.5, icon:'🔵', label:'Bajo peso',
          desc:'Podría ser recomendable aumentar tu ingesta calórica y consultar con un profesional si esta situación se mantiene.',
          cls:'imc-warning' },
        { max: 25,   icon:'🟢', label:'Peso saludable',
          desc:'Estás dentro del rango recomendado para la mayoría de adultos.',
          cls:'imc-good' },
        { max: 30,   icon:'🟡', label:'Sobrepeso',
          desc:'Puede ser un buen momento para mejorar tus hábitos de alimentación y actividad física.',
          cls:'imc-warning' },
        { max: 35,   icon:'🟠', label:'Obesidad grado I',
          desc:'Es recomendable consultar con un profesional para recibir orientación personalizada.',
          cls:'imc-danger' },
        { max: 40,   icon:'🔴', label:'Obesidad grado II',
          desc:'Existe un mayor riesgo para la salud y es aconsejable buscar asesoramiento profesional.',
          cls:'imc-danger' },
        { max: Infinity, icon:'🚨', label:'Obesidad grado III',
          desc:'Es importante acudir a un profesional sanitario para una valoración individual.',
          cls:'imc-danger' }
    ];

    function getCategory(imc) {
        return CATEGORIES.find(c => imc < c.max);
    }

    function showMessage(title, text, cls) {
        imcResult.classList.remove('imc-good', 'imc-warning', 'imc-danger');
        if (cls) imcResult.classList.add(cls);
        imcResult.innerHTML = `<h3>${title}</h3><p>${text}</p>`;

        imcResult.animate(
            [
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 400, easing: 'ease' }
        );
    }

    function calculate() {
        const height = Number(heightInput.value);
        const weight = Number(weightInput.value);

        imcResult.classList.remove('imc-good', 'imc-warning', 'imc-danger');

        if (!height || !weight) {
            return showMessage('⚠️ Datos incompletos', 'Introduce tu altura y tu peso.');
        }
        if (height < 80 || height > 250) {
            return showMessage('⚠️ Altura incorrecta', 'Introduce la altura en centímetros (80–250).');
        }
        if (weight < 20 || weight > 350) {
            return showMessage('⚠️ Peso incorrecto', 'Introduce un peso válido (20–350 kg).');
        }

        const meters = height / 100;
        const imc    = weight / (meters * meters);
        const value  = imc.toFixed(1);
        const cat    = getCategory(imc);

        showMessage(
            `${cat.icon} IMC: ${value} — ${cat.label}`,
            cat.desc,
            cat.cls
        );
    }

    function init() {
        imcButton.addEventListener('click', calculate);

        [heightInput, weightInput].forEach(input => {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') calculate();
            });

            /* Solo números y un único punto decimal */
            input.addEventListener('input', () => {
                let v = input.value.replace(/[^0-9.]/g, '');
                const parts = v.split('.');
                if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
                input.value = v;
            });

            input.addEventListener('focus', () => input.select());
        });
    }

    return { init };
})();

/* ============================================================
   4. UI GENERAL (navbar, scroll, reveal, top button, etc.)
   ============================================================ */

const UIModule = (() => {

    /* --- Navbar con scroll --- */
    function initNavbar() {
        const header = $('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 8px 30px rgba(0,0,0,.08)';
                header.style.background = 'rgba(255,255,255,.95)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'rgba(255,255,255,.85)';
            }
        }, { passive: true });
    }

    /* --- Scroll suave --- */
    function initSmoothScroll() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                const id = link.getAttribute('href');
                if (id === '#' || id.length < 2) return;
                const section = document.querySelector(id);
                if (section) {
                    e.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* --- Reveal con IntersectionObserver (único sistema) --- */
    function initReveal() {
        const elements = $$('.card, .question, .faq-item, .section-title, .imc-box, .result-box');
        if (!elements.length) return;

        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('show'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        elements.forEach(el => observer.observe(el));
    }

    /* --- Hover en botones "Comprar" --- */
    function initBuyButtons() {
        $$('.card .btn-black').forEach(button => {
            button.addEventListener('mouseenter', () => button.textContent = 'Comprar →');
            button.addEventListener('mouseleave', () => button.textContent = 'Comprar');
        });
    }

    /* --- Ripple en botones --- */
    function initRipple() {
        $$('.btn-black').forEach(button => {
            button.style.position = 'relative';
            button.style.overflow = 'hidden';

            button.addEventListener('click', function (e) {
                const circle = document.createElement('span');
                const diameter = Math.max(this.clientWidth, this.clientHeight);

                Object.assign(circle.style, {
                    width:  diameter + 'px',
                    height: diameter + 'px',
                    position: 'absolute',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.3)',
                    pointerEvents: 'none',
                    transform: 'scale(0)',
                    animation: 'ripple .6s linear'
                });

                const rect = this.getBoundingClientRect();
                circle.style.left = (e.clientX - rect.left - diameter / 2) + 'px';
                circle.style.top  = (e.clientY - rect.top  - diameter / 2) + 'px';

                this.appendChild(circle);
                setTimeout(() => circle.remove(), 600);
            });
        });
    }

    /* --- Menú hamburguesa --- */
    function initMobileMenu(){
        const toggle = document.getElementById('navToggle');
        const nav = document.getElementById('primaryNav');
        if(!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open);
            toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        });

        // Cerrar al pulsar un enlace
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Abrir menú');
            });
        });
    }

    /* --- Botón volver arriba --- */
    function initTopButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'topButton';
        btn.setAttribute('aria-label', 'Volver arriba');
        btn.innerHTML = '↑';
        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --- Año automático en footer --- */
    function initFooterYear() {
        const footer = $('footer');
        if (!footer) return;

        if (!$('#footerYear')) {
            const year = document.createElement('p');
            year.id = 'footerYear';
            year.className = 'footer-year';
            year.textContent = `© ${new Date().getFullYear()} AirNutrition. Todos los derechos reservados.`;
            footer.appendChild(year);
        }
    }

    /* --- Prevenir doble click accidental --- */
    function initDoubleClickGuard() {
        $$('button').forEach(button => {
            button.addEventListener('dblclick', e => e.preventDefault());
        });
    }

    /* --- Página cargada --- */
    function initLoadedClass() {
        window.addEventListener('load', () => document.body.classList.add('loaded'));
    }

    function init() {
        initNavbar();
        initSmoothScroll();
        initReveal();
        initBuyButtons();
        initRipple();
        initTopButton();
        initFooterYear();
        initDoubleClickGuard();
        initLoadedClass();
    }

    return { init };
})();

/* ============================================================
   5. ARRANQUE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    TestModule.init();
    IMCModule.init();
    UIModule.init();
    initMobileMenu();
    console.log('%cAir Nutrition', 'font-size:30px;font-weight:bold;color:#2f7d4f');
    console.log('%cLanding cargada correctamente.', 'font-size:14px;color:#666');
});
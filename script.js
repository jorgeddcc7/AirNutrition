/* ELEMENTOS DEL TEST */

const resultBox = document.getElementById("resultBox");
const recommendedBook = document.getElementById("recommendedBook");
const recommendedText = document.getElementById("recommendedText");

const questions=[

{

question:"¿Cuál es tu objetivo?",

answers:[

"Perder grasa",

"Ganar músculo",

"Mantener",

"Rendimiento"

],

type:"goal"

},

{

question:"¿Cuántos días entrenas?",

answers:[

"0-2 días",

"3-4 días",

"5+ días"

],

type:"days"

},

{

question:"¿Cuál es tu nivel?",

answers:[

"Principiante",

"Intermedio",

"Avanzado"

],

type:"level"

},

{

question:"¿Qué buscas?",

answers:[

"Nutrición",

"Entrenamiento",

"Ambos"

],

type:"need"

},

{

question:"¿Cómo prefieres progresar?",

answers:[

"Rápido",

"Poco a poco"

],

type:"speed"

}

];

let currentQuestion=0;

const answers={};

const title=document.getElementById("questionTitle");
const container=document.getElementById("answersContainer");
const step=document.getElementById("stepText");
const progress=document.getElementById("progressFill");

const prev=document.getElementById("prevBtn");
const next=document.getElementById("nextBtn");

loadQuestion();

function loadQuestion(){

const q=questions[currentQuestion];

title.innerHTML=q.question;

container.innerHTML="";

step.innerHTML=`Pregunta ${currentQuestion+1} de ${questions.length}`;

progress.style.width=((currentQuestion+1)/questions.length*100)+"%";

q.answers.forEach(answer=>{

const div=document.createElement("div");

div.className="answer";

div.innerHTML=answer;

if(answers[q.type]==answer){

div.classList.add("selected");

}

div.onclick=()=>{

document.querySelectorAll(".answer").forEach(a=>a.classList.remove("selected"));

div.classList.add("selected");

answers[q.type]=answer;

};

container.appendChild(div);

});

prev.disabled=currentQuestion==0;

next.innerHTML=currentQuestion==questions.length-1
?"Ver resultado"
:"Siguiente";

}

next.onclick=()=>{

const type=questions[currentQuestion].type;

if(!answers[type]){

alert("Selecciona una opción");

return;

}

if(currentQuestion<questions.length-1){

currentQuestion++;

loadQuestion();

}

else{

finishTest();

}

};

prev.onclick=()=>{

if(currentQuestion>0){

currentQuestion--;

loadQuestion();

}

};

function finishTest(){

document.querySelector(".test-container").style.display="none";

resultBox.style.display="block";

recommendedBook.innerHTML="Calculando...";

recommendedText.innerHTML="";

setTimeout(()=>{

const goal=answers.goal;

switch(goal){

case"Perder grasa":

recommendedBook.innerHTML="🔥 Cuadernillo Definición";

recommendedText.innerHTML="Nuestro cuadernillo de definición está pensado para ayudarte a perder grasa sin perder músculo mediante una alimentación equilibrada y una rutina eficaz.";

break;

case"Ganar músculo":

recommendedBook.innerHTML="💪 Cuadernillo Volumen";

recommendedText.innerHTML="Aprende a ganar masa muscular con un superávit bien estructurado y una planificación de entrenamiento progresiva.";

break;

case"Mantener":

recommendedBook.innerHTML="⚖️ Cuadernillo Mantenimiento";

recommendedText.innerHTML="Ideal para mantener tu físico todo el año sin dietas estrictas.";

break;

default:

recommendedBook.innerHTML="🏃 Cuadernillo Rendimiento";

recommendedText.innerHTML="Optimiza tu alimentación y entrenamiento para mejorar tu rendimiento deportivo.";

}

},1000);

}

/*==================================================
                ANIMACIONES SCROLL
==================================================*/

const revealElements = document.querySelectorAll(
    ".card, .question, .faq-item, .imc-box, .result-box"
);

function revealOnScroll() {

    const trigger = window.innerHeight * 0.85;

    revealElements.forEach((element) => {

        const top = element.getBoundingClientRect().top;

        if (top < trigger) {

            element.classList.add("show");

        }

    });

}

window.addEventListener("scroll", revealOnScroll);

window.addEventListener("load", revealOnScroll);

/*==================================================
            EFECTO EN BOTONES (opcional)
==================================================*/

const buttons = document.querySelectorAll(
    ".btn-black, .btn-white, .btn-nav"
);

buttons.forEach((button) => {

    button.addEventListener("mousedown", () => {

        button.style.transform = "scale(0.97)";

    });

    button.addEventListener("mouseup", () => {

        button.style.transform = "";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "";

    });

});

/*==================================================
            RESALTAR OPCIÓN SELECCIONADA
==================================================*/

const radioButtons = document.querySelectorAll(
    '.question input[type="radio"]'
);

radioButtons.forEach((radio) => {

    radio.addEventListener("change", () => {

        // Buscar todas las etiquetas del mismo grupo

        const group = radio.name;

        document
            .querySelectorAll(`input[name="${group}"]`)
            .forEach((input) => {

                input.parentElement.style.borderColor = "#dddddd";
                input.parentElement.style.background = "#ffffff";

            });

        // Resaltar la seleccionada
        radio.parentElement.style.borderColor = "#111111";
        radio.parentElement.style.background = "#f3f3f3";
    });
});

/*==================================================
                CALCULADORA IMC
==================================================*/

const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const imcButton = document.getElementById("calculateIMC");
const imcResult = document.getElementById("imcResult");

if (imcButton) {

    imcButton.addEventListener("click", calculateIMC);

}

// También calcular pulsando ENTER

[heightInput, weightInput].forEach(input => {

    if (input) {

        input.addEventListener("keypress", function(e){

            if(e.key === "Enter"){

                calculateIMC();

            }

        });

    }

});

function calculateIMC(){

    const height = Number(heightInput.value);
    const weight = Number(weightInput.value);

    // Limpiar clases anteriores

    imcResult.classList.remove(
        "imc-good",
        "imc-warning",
        "imc-danger"
    );

    // Validaciones

    if(!height || !weight){

        showIMCMessage(
            "⚠️ Datos incompletos",
            "Introduce tu altura y tu peso."
        );

        return;

    }

    if(height < 80 || height > 250){

        showIMCMessage(
            "⚠️ Altura incorrecta",
            "Introduce la altura en centímetros."
        );

        return;

    }

    if(weight < 20 || weight > 350){

        showIMCMessage(
            "⚠️ Peso incorrecto",
            "Introduce un peso válido."
        );

        return;

    }

    // Conversión

    const meters = height / 100;

    const imc = weight / (meters * meters);

    const value = imc.toFixed(1);

    let title = "";
    let description = "";

    /*=====================================
                CLASIFICACIÓN
    =====================================*/

    if(imc < 18.5){

        title = `🔵 IMC: ${value}`;

        description =
        "Bajo peso. Podría ser recomendable aumentar tu ingesta calórica y consultar con un profesional si esta situación se mantiene.";

        imcResult.classList.add("imc-warning");

    }

    else if(imc < 25){

        title = `🟢 IMC: ${value}`;

        description =
        "Peso saludable. Estás dentro del rango recomendado para la mayoría de adultos.";

        imcResult.classList.add("imc-good");

    }

    else if(imc < 30){

        title = `🟡 IMC: ${value}`;

        description =
        "Sobrepeso. Puede ser un buen momento para mejorar tus hábitos de alimentación y actividad física.";

        imcResult.classList.add("imc-warning");

    }

    else if(imc < 35){

        title = `🟠 IMC: ${value}`;

        description =
        "Obesidad grado I. Es recomendable consultar con un profesional para recibir orientación personalizada.";

        imcResult.classList.add("imc-danger");

    }

    else if(imc < 40){

        title = `🔴 IMC: ${value}`;

        description =
        "Obesidad grado II. Existe un mayor riesgo para la salud y es aconsejable buscar asesoramiento profesional.";

        imcResult.classList.add("imc-danger");

    }

    else{

        title = `🚨 IMC: ${value}`;

        description =
        "Obesidad grado III. Es importante acudir a un profesional sanitario para una valoración individual.";

        imcResult.classList.add("imc-danger");

    }

    showIMCMessage(title, description);

}

/*==================================================
                MOSTRAR RESULTADO
==================================================*/

function showIMCMessage(title, text){

    imcResult.innerHTML = `

        <h3>${title}</h3>

        <p>${text}</p>

    `;

}

/*==================================================
                EFECTO DE ENTRADA
==================================================*/

if(imcButton){

    imcButton.addEventListener("click", () => {

        imcResult.animate(

            [

                {

                    opacity:0,

                    transform:"translateY(20px)"

                },

                {

                    opacity:1,

                    transform:"translateY(0)"

                }

            ],

            {

                duration:400,

                easing:"ease"

            }

        );

    });

}

/*==================================================
                FORMATO INPUT
==================================================*/

const numericInputs = document.querySelectorAll(
    "#height, #weight"
);

numericInputs.forEach(input => {

    input.addEventListener("input", () => {

        input.value = input.value.replace(/[^0-9.]/g,"");

    });

});

numericInputs.forEach(input => {

    input.addEventListener("focus", () => {

        input.select();

    });

});

/*==================================================
            FITNESSBOOK
            SCRIPT.JS - PARTE 3
==================================================*/


/*==================================================
            NAVBAR AL HACER SCROLL
==================================================*/

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if(window.scrollY > 50){

        header.style.padding = "0";
        header.style.boxShadow = "0 8px 30px rgba(0,0,0,.08)";
        header.style.background = "rgba(255,255,255,.95)";
        header.style.backdropFilter = "blur(14px)";

    }

    else{

        header.style.boxShadow = "none";
        header.style.background = "rgba(255,255,255,.85)";

    }

});


/*==================================================
            SCROLL SUAVE EN ENLACES
==================================================*/

document.querySelectorAll('a[href^="#"]').forEach(link=>{

    link.addEventListener("click",function(e){

        e.preventDefault();

        const id=this.getAttribute("href");

        const section=document.querySelector(id);

        if(section){

            section.scrollIntoView({

                behavior:"smooth",
                block:"start"

            });

        }

    });

});


/*==================================================
            EFECTO PARALLAX HERO
==================================================*/

const hero=document.querySelector(".hero");

window.addEventListener("scroll",()=>{

    const offset=window.scrollY;

    hero.style.backgroundPositionY=offset*0.3+"px";

});


/*==================================================
            APARICIÓN PROGRESIVA
==================================================*/

const observer=new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:0.15
});

document.querySelectorAll(

    ".card, .question, .faq-item, .section-title, .imc-box"

).forEach(el=>{

    observer.observe(el);

});


/*==================================================
            CONTADOR BOTONES
==================================================*/

const buyButtons=document.querySelectorAll(".card .btn-black");

buyButtons.forEach(button=>{

    button.addEventListener("mouseenter",()=>{

        button.innerHTML="Comprar →";

    });

    button.addEventListener("mouseleave",()=>{

        button.innerHTML="Comprar";

    });

});


/*==================================================
            ANIMACIÓN TARJETAS
==================================================*/

const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

    card.addEventListener("mousemove",(e)=>{

        const rect=card.getBoundingClientRect();

        const x=e.clientX-rect.left;
        const y=e.clientY-rect.top;

        const centerX=rect.width/2;
        const centerY=rect.height/2;

        const rotateX=((y-centerY)/18);
        const rotateY=((centerX-x)/18);

        card.style.transform=
        `perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-10px)`;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="";

    });

});


/*==================================================
            EFECTO RIPPLE BOTONES
==================================================*/

document.querySelectorAll(".btn-black").forEach(button=>{

    button.addEventListener("click",function(e){

        const circle=document.createElement("span");

        const diameter=Math.max(
            this.clientWidth,
            this.clientHeight
        );

        circle.style.width=diameter+"px";
        circle.style.height=diameter+"px";

        circle.style.position="absolute";
        circle.style.borderRadius="50%";
        circle.style.background="rgba(255,255,255,.3)";
        circle.style.pointerEvents="none";
        circle.style.transform="scale(0)";
        circle.style.animation="ripple .6s linear";

        const rect=this.getBoundingClientRect();

        circle.style.left=e.clientX-rect.left-diameter/2+"px";
        circle.style.top=e.clientY-rect.top-diameter/2+"px";

        this.appendChild(circle);

        setTimeout(()=>{

            circle.remove();

        },600);

    });

});


/*==================================================
            CARGA DE PÁGINA
==================================================*/

window.addEventListener("load",()=>{

    document.body.classList.add("loaded");

});


/*==================================================
            BOTÓN VOLVER ARRIBA
==================================================*/

const topButton=document.createElement("button");

topButton.innerHTML="↑";

topButton.className="topButton";

document.body.appendChild(topButton);

topButton.style.position="fixed";
topButton.style.right="25px";
topButton.style.bottom="25px";
topButton.style.width="55px";
topButton.style.height="55px";
topButton.style.borderRadius="50%";
topButton.style.border="none";
topButton.style.background="#111";
topButton.style.color="white";
topButton.style.fontSize="22px";
topButton.style.cursor="pointer";
topButton.style.opacity="0";
topButton.style.transition=".3s";
topButton.style.zIndex="999";


window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        topButton.style.opacity="1";

    }

    else{

        topButton.style.opacity="0";

    }

});


topButton.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});


/*==================================================
            AÑO AUTOMÁTICO FOOTER
==================================================*/

const footer=document.querySelector("footer");

if(footer){

    const year=document.createElement("p");

    year.style.marginTop="40px";
    year.style.color="#999";
    year.style.fontSize=".9rem";
    year.style.textAlign="center";

    year.innerHTML=`© ${new Date().getFullYear()} FitnessBook. Todos los derechos reservados.`;

    footer.appendChild(year);

}


/*==================================================
            PREVENIR DOBLE CLICK
==================================================*/

document.querySelectorAll("button").forEach(button=>{

    button.addEventListener("dblclick",(e)=>{

        e.preventDefault();

    });

});

console.log("%cFitnessBook",
"font-size:30px;font-weight:bold;color:#111");

console.log("%cLanding desarrollada correctamente.",
"font-size:14px;color:#666");

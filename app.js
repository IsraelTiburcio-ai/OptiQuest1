/* ============================================================
   OptiQuest - Gimnasio de Sistemas  (MVP)
   Mini RPG educativo · Teoría General de Sistemas
   HTML + CSS + JS puro + Canvas 2D. Sin frameworks.
   ------------------------------------------------------------
   Secciones:
     1) Constants
     2) State
     3) Save system (localStorage)
     4) Asset / Audio manager
     5) Input manager (teclado + táctil)
     6) Render helpers
     7) Scene manager
     8) Title scene
     9) Intro scene
    10) Map scene
    11) Dialogue system
    12) Battle scene
    13) Result / Menu
    14) Main loop
    15) Boot
   ============================================================ */

(function () {
  "use strict";

  /* =========================================================
     1) CONSTANTS
     ========================================================= */
  const CANVAS_W = 360;
  const CANVAS_H = 640;
  const TILE = 32;
  const MOVE_SPEED = 1.7;          // px por frame a ~60fps
  const INTERACT_RANGE = 34;
  const SAVE_KEY = "optiquest_save_v1";
  const DATA_URL = "data/gym1.json";

  const DMG_TO_ENEMY = 12;         // daño por respuesta correcta
  const DMG_TO_PLAYER = 10;        // daño por respuesta incorrecta
  const ANIM_DUR = 0.45;           // segundos de animación de golpe

  // Preguntas por playlist de batalla (pool aleatorio por categorías).
  // La duración no cambia: basta con 3/4/5 aciertos para vencer (30/40/50 HP).
  const BATTLE_POOL = { fundamentos: 8, clasificacion: 10, evolucion: 10 };

  // Paleta retro
  const C = {
    grassA: "#2f6f3a",
    grassB: "#357a42",
    path: "#c9b98a",
    pathEdge: "#a89464",
    tree: "#1f4a26",
    treeLight: "#2c6a36",
    trunk: "#5a3a22",
    water: "#2a4f8a",
    ink: "#e8eef7",
    panel: "#1b2238",
    border: "#7da6d8",
    borderDark: "#4d6a9e",
    shadow: "rgba(0,0,0,0.25)",
    heroBody: "#4d8cff",
    heroSkin: "#f0c8a0",
    heroLegs: "#2a2a44",
  };

  /* Datos embebidos de respaldo: se usan si fetch(data/gym1.json)
     falla (por ejemplo al abrir con file://). Así el juego nunca
     se rompe aunque el JSON no cargue. Refleja /data/gym1.json. */
  const FALLBACK_DATA = {
    meta: {
      name: "OptiQuest - Gimnasio de Sistemas",
      gym: "Gimnasio 1 - Introducción a la Teoría de Sistemas (actividad de refuerzo, hasta Diseño de Sistemas)",
      version: "1.1.0"
    },
    player: {
      name: "Aprendiz",
      maxHp: 50,
      attack: 10
    },
    zones: [
      {
        id: "fundamentos",
        title: "Fundamentos del Sistema",
        npc: "Profa Sistemas",
        mapColor: "#3aa856",
        dialogue: [
          "Para dominar los sistemas, primero entiende qué son y de qué se componen.",
          "Un sistema integra elementos, relaciones, propósito, componentes y un medio ambiente.",
          "También distingue sus elementos: objetos, sujetos y conceptos.",
          "Demuestra que dominas estos fundamentos venciendo al Caos Inicial."
        ],
        victoryDialogue: [
          "¡Excelente! Ya dominas los fundamentos del sistema.",
          "Sigue al Guardián de Fronteras para aprender a clasificar y delimitar."
        ],
        enemy: {
          name: "Caos Inicial",
          hp: 30,
          color: "#b04848"
        },
        questions: [
          {
            category: "sistema",
            question: "¿Cuál opción describe mejor un sistema?",
            options: [
              "Un conjunto de elementos relacionados que interactúan",
              "Una variable aislada sin relación con nada",
              "Una fórmula matemática sin contexto",
              "Una lista de datos ordenados"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Un sistema integra elementos que se relacionan e interactúan.",
            feedbackWrong: "Un sistema necesita elementos que se relacionan entre sí e interactúan para cumplir un propósito."
          },
          {
            category: "sistema",
            question: "Para entender un sistema es clave observar...",
            options: [
              "Sus partes, relaciones y propósito",
              "Solo sus partes, sin importar las relaciones",
              "Únicamente su propósito final",
              "Su ubicación geográfica"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Partes, relaciones y propósito son la base para entender un sistema.",
            feedbackWrong: "Lo esencial es observar sus partes, las relaciones entre ellas y su propósito común."
          },
          {
            category: "sistema",
            question: "¿Un sistema puede existir sin relaciones entre sus elementos?",
            options: [
              "Sí, basta con que tenga muchos elementos",
              "No, las relaciones son esenciales para que sea un sistema",
              "Solo si sus elementos son muy grandes",
              "Solo si no tiene propósito"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Sin relaciones entre sus elementos no existe un sistema.",
            feedbackWrong: "Las relaciones entre elementos son esenciales; sin ellas no podemos hablar de sistema."
          },
          {
            category: "sistema",
            question: "El propósito de un sistema se refiere a...",
            options: [
              "El tamaño físico que alcanza",
              "La meta u objetivo para el que fue formado",
              "El material del que está hecho",
              "La cantidad de elementos que lo componen"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El propósito es la meta u objetivo para el que se forma el sistema.",
            feedbackWrong: "El propósito es la meta u objetivo que el sistema persigue."
          },
          {
            category: "sistema",
            question: "En un consultorio médico, la enfermera, la balanza y el expediente solo forman un sistema porque...",
            options: [
              "Se relacionan e interactúan para atender pacientes",
              "Están dentro del mismo edificio",
              "Fueron comprados el mismo año",
              "Tienen el mismo color institucional"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Es la interacción entre sus elementos lo que forma el sistema.",
            feedbackWrong: "Tener varios elementos no basta: deben relacionarse e interactuar para un propósito común."
          },
          {
            category: "componentes",
            question: "¿Qué es la entrada de un sistema?",
            options: [
              "El resultado final del sistema",
              "Lo que ingresa al sistema para ser procesado",
              "El ajuste que se hace al sistema",
              "El entorno que rodea al sistema"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! La entrada es lo que ingresa al sistema para ser procesado.",
            feedbackWrong: "La entrada son los elementos o datos que ingresan al sistema para ser procesados."
          },
          {
            category: "componentes",
            question: "El proceso dentro de un sistema se encarga de...",
            options: [
              "Recibir el entorno",
              "Transformar la entrada en salida",
              "Medir el resultado",
              "Detener el sistema"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El proceso transforma la entrada en salida.",
            feedbackWrong: "El proceso transforma la entrada para producir la salida."
          },
          {
            category: "componentes",
            question: "¿Qué es la salida de un sistema?",
            options: [
              "El resultado que el sistema entrega tras el proceso",
              "Lo que ingresa al sistema",
              "Un error del sistema",
              "El entorno externo"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! La salida es el resultado que entrega el sistema.",
            feedbackWrong: "La salida es el resultado que el sistema entrega después del proceso."
          },
          {
            category: "componentes",
            question: "La retroalimentación sirve para...",
            options: [
              "Registrar la salida sin hacer cambios",
              "Ajustar el funcionamiento con base en los resultados",
              "Incrementar la cantidad de entradas",
              "Sustituir por completo al proceso"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! La retroalimentación ajusta el sistema según sus resultados.",
            feedbackWrong: "La retroalimentación usa la información de la salida para ajustar el sistema."
          },
          {
            category: "componentes",
            question: "¿Qué es el medio ambiente de un sistema?",
            options: [
              "El resultado final del sistema",
              "El conjunto de elementos internos",
              "El entorno externo que rodea al sistema",
              "El propósito del sistema"
            ],
            answer: 2,
            feedbackCorrect: "¡Correcto! El medio ambiente es el entorno que rodea al sistema.",
            feedbackWrong: "El medio ambiente es todo lo que rodea al sistema y con lo que interactúa."
          },
          {
            category: "componentes",
            question: "En un restaurante, la materia prima que compra el chef para cocinar es la...",
            options: [
              "Salida del sistema",
              "Entrada del sistema",
              "Retroalimentación",
              "Medio ambiente"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! La materia prima ingresa al restaurante para ser procesada.",
            feedbackWrong: "Lo que ingresa para ser procesado es la entrada del sistema."
          },
          {
            category: "componentes",
            question: "Una calificación baja en un examen hace que la profesora ajuste sus explicaciones. En el sistema 'clase', esa información que se usa para ajustar es la...",
            options: [
              "Retroalimentación",
              "Entrada",
              "Salida",
              "Medio ambiente"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! La información de la salida que se usa para ajustar es la retroalimentación.",
            feedbackWrong: "Es la retroalimentación: la información de los resultados que permite ajustar el sistema."
          },
          {
            category: "elementos",
            question: "En el sistema 'clase de Optimización', ¿qué tipo de elemento es el profesor?",
            options: [
              "Objeto",
              "Sujeto",
              "Concepto",
              "Salida"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El profesor es un sujeto: una persona que piensa y participa en el sistema.",
            feedbackWrong: "El profesor es un sujeto, porque es una persona pensante dentro del sistema."
          },
          {
            category: "elementos",
            question: "En el sistema 'clase de Optimización', el pizarrón y el proyector son elementos de tipo...",
            options: [
              "Objetos",
              "Sujetos",
              "Conceptos",
              "Entradas"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Son objetos: elementos físicos y no vivientes del sistema.",
            feedbackWrong: "El pizarrón y el proyector son objetos, pues son elementos físicos no vivientes."
          },
          {
            category: "elementos",
            question: "En una biblioteca, la idea de 'reglamento de préstamo' corresponde a un elemento de tipo...",
            options: [
              "Objeto",
              "Sujeto",
              "Concepto",
              "Proceso"
            ],
            answer: 2,
            feedbackCorrect: "¡Correcto! El reglamento es una idea, un concepto del sistema.",
            feedbackWrong: "Una idea o abstracción es un concepto, no un objeto ni un sujeto."
          },
          {
            category: "elementos",
            question: "En una granja, el tractor es un elemento de tipo...",
            options: [
              "Objeto",
              "Sujeto",
              "Concepto",
              "Retroalimentación"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El tractor es un objeto: equipo o elemento físico.",
            feedbackWrong: "El tractor es un objeto, un elemento físico y no viviente."
          }
        ]
      },
      {
        id: "clasificacion",
        title: "Clasificar y Delimitar",
        npc: "Guardián de Fronteras",
        mapColor: "#3a8ac8",
        dialogue: [
          "Un sistema se entiende mejor al clasificarlo y delimitar sus fronteras.",
          "¿Es viviente o no? ¿Abstracto o concreto? ¿Abierto o cerrado? ¿Estático, dinámico u homeostático?",
          "También distingue subsistemas, suprasistemas y las fronteras física, económica, técnica y temporal.",
          "Vénceme y demostrarás que sabes clasificar y delimitar."
        ],
        victoryDialogue: [
          "¡Bien hecho! Ya sabes clasificar sistemas y delimitar sus fronteras.",
          "El Líder del Gimnasio te espera para la prueba final de evolución, mejoramiento y diseño."
        ],
        enemy: {
          name: "Olvido",
          hp: 40,
          color: "#7048b0"
        },
        questions: [
          {
            category: "clasificacion",
            question: "Un organismo humano que intercambia materia y energía con el ambiente es un sistema...",
            options: [
              "Abierto",
              "Cerrado",
              "Abstracto",
              "Estático"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Al intercambiar materia y energía con el ambiente, es un sistema abierto.",
            feedbackWrong: "Es abierto porque intercambia materia y energía con su ambiente."
          },
          {
            category: "clasificacion",
            question: "El sistema 'y = 3x + 2', representado como una idea matemática, es un ejemplo de sistema...",
            options: [
              "Concreto",
              "Abstracto",
              "Viviente",
              "Cerrado"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Es abstracto porque existe como idea, no como algo físico.",
            feedbackWrong: "Una representación que existe en el pensamiento es un sistema abstracto."
          },
          {
            category: "clasificacion",
            question: "Un automóvil, aunque esté en funcionamiento, es un sistema...",
            options: [
              "Viviente",
              "No viviente",
              "Abstracto",
              "Homeostático"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El automóvil es un sistema no viviente.",
            feedbackWrong: "El automóvil no tiene vida; es un sistema no viviente."
          },
          {
            category: "clasificacion",
            question: "Una biblioteca con sus estantes, libros y computadoras es un ejemplo de sistema...",
            options: [
              "Abstracto",
              "Viviente",
              "Concreto",
              "Cerrado"
            ],
            answer: 2,
            feedbackCorrect: "¡Correcto! Sus elementos son físicos y tangibles: es un sistema concreto.",
            feedbackWrong: "Un sistema cuyos elementos son físicos y tangibles es concreto."
          },
          {
            category: "clasificacion",
            question: "Una computadora apagada que no realiza cambios se considera un sistema...",
            options: [
              "Estático",
              "Dinámico",
              "Homeostático",
              "Abierto"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Al no presentar cambios se considera un sistema estático.",
            feedbackWrong: "Un sistema sin cambios en el tiempo es estático."
          },
          {
            category: "clasificacion",
            question: "El clima de una región cambia constantemente con el viento y la lluvia. Es un sistema...",
            options: [
              "Estático",
              "Dinámico",
              "Homeostático",
              "Abstracto"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Sus elementos cambian continuamente: es dinámico.",
            feedbackWrong: "Como presenta cambios constantes, se trata de un sistema dinámico."
          },
          {
            category: "clasificacion",
            question: "Un sistema que mantiene estables sus condiciones internas a pesar de los cambios del entorno se denomina...",
            options: [
              "Estático",
              "Dinámico",
              "Homeostático",
              "Cerrado"
            ],
            answer: 2,
            feedbackCorrect: "¡Correcto! El sistema regula su interior para mantenerse estable: es homeostático.",
            feedbackWrong: "El que mantiene su equilibrio interno frente al entorno es homeostático."
          },
          {
            category: "clasificacion",
            question: "Un experimento sellado al vacío que no intercambia materia con su entorno es un sistema...",
            options: [
              "Abierto",
              "Cerrado",
              "Dinámico",
              "Concreto"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Al no intercambiar materia con el entorno es un sistema cerrado.",
            feedbackWrong: "El que no intercambia materia o energía con su ambiente es cerrado."
          },
          {
            category: "clasificacion",
            question: "Un árbol que nace, crece y muere es un sistema...",
            options: [
              "Viviente",
              "No viviente",
              "Estático",
              "Abstracto"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El árbol tiene vida: es un sistema viviente.",
            feedbackWrong: "Los seres vivos, como el árbol, son sistemas vivientes."
          },
          {
            category: "jerarquia",
            question: "¿Qué es un subsistema?",
            options: [
              "Un sistema que contiene a otros sistemas",
              "Una parte de un sistema más grande",
              "El ambiente externo",
              "El propósito del sistema"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Un subsistema es parte de un sistema mayor.",
            feedbackWrong: "Un subsistema es un sistema que forma parte de un sistema más grande."
          },
          {
            category: "jerarquia",
            question: "¿Qué es un suprasistema?",
            options: [
              "Una parte pequeña de un sistema",
              "Un sistema que contiene a otros sistemas",
              "La salida de un sistema",
              "Un tipo de retroalimentación"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El suprasistema contiene a otros sistemas.",
            feedbackWrong: "Un suprasistema es el sistema mayor que contiene a otros sistemas (subsistemas)."
          },
          {
            category: "jerarquia",
            question: "Si una escuela es un sistema, los grupos dentro de ella son...",
            options: [
              "Suprasistemas",
              "Subsistemas",
              "Ambientes",
              "Salidas"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Los grupos son subsistemas de la escuela.",
            feedbackWrong: "Los grupos, al ser parte de la escuela, son sus subsistemas."
          },
          {
            category: "jerarquia",
            question: "Un sistema y su entorno dan como resultado un...",
            options: [
              "Subsistema",
              "Suprasistema",
              "Proceso",
              "Elemento"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El sistema y su entorno dan como resultado un suprasistema.",
            feedbackWrong: "El sistema y su entorno forman un suprasistema que lo contiene."
          },
          {
            category: "jerarquia",
            question: "En el sistema 'ser humano', el sistema nervioso es un...",
            options: [
              "Subsistema",
              "Suprasistema",
              "Medio ambiente",
              "Objeto"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El sistema nervioso es parte del sistema humano: un subsistema.",
            feedbackWrong: "El sistema nervioso forma parte del sistema humano, por eso es un subsistema."
          },
          {
            category: "fronteras",
            question: "Una empresa quiere ampliar su planta, pero solo dispone de $100,000. ¿Qué frontera está limitando al sistema?",
            options: [
              "Física",
              "Económica",
              "Técnica",
              "Temporal"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! La limitación es económica porque se refiere al presupuesto disponible.",
            feedbackWrong: "La frontera económica se refiere a la capacidad monetaria: el presupuesto disponible."
          },
          {
            category: "fronteras",
            question: "Un edificio solo puede ocupar el terreno de 500 m² que posee. ¿Qué frontera limita al sistema?",
            options: [
              "Física",
              "Económica",
              "Técnica",
              "Temporal"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! La frontera física es el límite espacial o corporal.",
            feedbackWrong: "La frontera física se refiere al límite espacial o corporal del sistema."
          },
          {
            category: "fronteras",
            question: "El proyecto debe concluirse en 6 meses. ¿Qué frontera lo limita?",
            options: [
              "Económica",
              "Técnica",
              "Física",
              "Temporal"
            ],
            answer: 3,
            feedbackCorrect: "¡Correcto! La frontera temporal es la duración en el tiempo.",
            feedbackWrong: "La frontera temporal corresponde a la duración en el tiempo del sistema."
          },
          {
            category: "fronteras",
            question: "Solo pueden participar en el proyecto personas con estudios de posgrado. ¿Qué frontera limita al sistema?",
            options: [
              "Técnica",
              "Económica",
              "Física",
              "Temporal"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! La frontera técnica se refiere al nivel de estudios requerido.",
            feedbackWrong: "La frontera técnica es el nivel de estudios o preparación exigido por el sistema."
          },
          {
            category: "fronteras",
            question: "Un sistema de transporte público solo opera dentro de los límites de la ciudad. ¿Qué frontera describe esa situación?",
            options: [
              "Física",
              "Económica",
              "Técnica",
              "Temporal"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El límite territorial es una frontera física.",
            feedbackWrong: "El límite espacial o territorial corresponde a la frontera física."
          }
        ]
      },
      {
        id: "evolucion",
        title: "Evolución, Mejoramiento y Diseño",
        npc: "Líder del Gimnasio",
        mapColor: "#b09030",
        dialogue: [
          "Esta es la prueba final de repaso.",
          "Recuerda el ciclo de vida del sistema: nacimiento, crecimiento, evolución gradual, estabilidad y muerte.",
          "Y distingue el mejoramiento (optimizar lo que ya existe) del diseño (crear nuevas alternativas).",
          "¡Demuestra tu dominio y conviértete en Maestra de Sistemas!"
        ],
        victoryDialogue: [
          "¡Increíble! Has vencido el Gimnasio de Sistemas.",
          "Dominas desde el concepto de sistema hasta el diseño de sistemas. Eres oficialmente una Maestra de Sistemas. ¡Felicidades!"
        ],
        enemy: {
          name: "Entropía Final",
          hp: 50,
          color: "#c84030"
        },
        questions: [
          {
            category: "ciclo",
            question: "Una organización ya alcanzó un funcionamiento constante y mantiene sus operaciones sin grandes cambios. ¿En qué etapa del ciclo de vida se encuentra?",
            options: [
              "Nacimiento",
              "Crecimiento",
              "Evolución gradual",
              "Estabilidad"
            ],
            answer: 3,
            feedbackCorrect: "¡Correcto! La etapa de funcionamiento constante es la estabilidad.",
            feedbackWrong: "La estabilidad es la etapa donde el sistema se mantiene funcionando sin grandes cambios."
          },
          {
            category: "ciclo",
            question: "Un proyecto comienza con una idea y su primera planeación. ¿En qué etapa del ciclo está?",
            options: [
              "Nacimiento",
              "Crecimiento",
              "Estabilidad",
              "Muerte"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El nacimiento es el inicio del sistema.",
            feedbackWrong: "La etapa inicial, donde el sistema surge, es el nacimiento."
          },
          {
            category: "ciclo",
            question: "Una empresa aumenta su personal, sus ventas y sus instalaciones año con año. ¿En qué etapa del ciclo se encuentra?",
            options: [
              "Nacimiento",
              "Crecimiento",
              "Evolución gradual",
              "Estabilidad"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El aumento constante es propio de la etapa de crecimiento.",
            feedbackWrong: "La expansión continua del sistema corresponde al crecimiento."
          },
          {
            category: "ciclo",
            question: "Un sistema de riego se adapta poco a poco para consumir menos agua con el paso del tiempo. ¿En qué etapa está?",
            options: [
              "Nacimiento",
              "Crecimiento",
              "Evolución gradual",
              "Muerte"
            ],
            answer: 2,
            feedbackCorrect: "¡Correcto! El cambio paulatino del sistema es su evolución gradual.",
            feedbackWrong: "La adaptación lenta y paulatina corresponde a la evolución gradual."
          },
          {
            category: "ciclo",
            question: "Cuando un sistema deja de funcionar y desaparece, se encuentra en la etapa de...",
            options: [
              "Estabilidad",
              "Muerte",
              "Nacimiento",
              "Crecimiento"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El fin del sistema es su muerte.",
            feedbackWrong: "La etapa final del ciclo, cuando el sistema deja de funcionar, es la muerte."
          },
          {
            category: "ciclo",
            question: "¿Cuál es el orden correcto del ciclo de vida de un sistema?",
            options: [
              "Nacimiento, crecimiento, evolución gradual, estabilidad, muerte",
              "Estabilidad, muerte, nacimiento, crecimiento, evolución gradual",
              "Nacimiento, muerte, estabilidad, crecimiento, evolución gradual",
              "Evolución gradual, nacimiento, estabilidad, muerte, crecimiento"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Ese es el orden del ciclo de vida del sistema.",
            feedbackWrong: "El ciclo sigue el orden: nacimiento, crecimiento, evolución gradual, estabilidad y muerte."
          },
          {
            category: "mejoramiento",
            question: "En el sistema 'transporte público', cambiar las unidades viejas por unidades nuevas y capacitar a los choferes es un ejemplo de...",
            options: [
              "Mejoramiento",
              "Diseño",
              "Nacimiento",
              "Clasificación"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Se optimiza un sistema que ya existe: eso es mejoramiento.",
            feedbackWrong: "Mejorar actúa sobre un sistema existente para optimizarlo, como renovar el transporte."
          },
          {
            category: "mejoramiento",
            question: "Una empresa ya establecida modifica su proceso de producción para reducir costos, sin crear un sistema nuevo. Esto es...",
            options: [
              "Diseño",
              "Mejoramiento",
              "Ciclo de vida",
              "Frontera temporal"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Optimizar un sistema existente es mejoramiento.",
            feedbackWrong: "Como el sistema ya existe y solo se optimiza, es un mejoramiento."
          },
          {
            category: "mejoramiento",
            question: "Según el Gimnasio, el mejoramiento se interesa principalmente por...",
            options: [
              "Las sustancias, el contenido y las causas",
              "La estructura y los procesos",
              "El método y la función",
              "Las salidas innovadoras y creativas"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El mejoramiento se interesa por las sustancias, el contenido y las causas.",
            feedbackWrong: "En el mejoramiento los intereses son las sustancias, el contenido y las causas."
          },
          {
            category: "mejoramiento",
            question: "En el mejoramiento se explica principalmente...",
            options: [
              "La desviación del pasado",
              "La predicción de resultados futuros",
              "La cosmovisión de los clientes",
              "Las salidas innovadoras"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El mejoramiento explica la desviación del pasado.",
            feedbackWrong: "El mejoramiento se enfoca en explicar la desviación del pasado."
          },
          {
            category: "diseno",
            question: "En el sistema 'transporte público', diseñar mejores rutas para que llegue más rápido a su destino es un ejemplo de...",
            options: [
              "Mejoramiento",
              "Diseño",
              "Estabilidad",
              "Retroalimentación"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! Crear nuevas alternativas para el sistema es diseño.",
            feedbackWrong: "Al plantear nuevas alternativas para el sistema, se trata de un diseño."
          },
          {
            category: "diseno",
            question: "El diseño de sistemas involucra principalmente...",
            options: [
              "La planeación, evaluación e implantación de nuevas alternativas",
              "Cambiar piezas del sistema existente",
              "Explicar los errores del pasado",
              "Reducir el presupuesto"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El diseño involucra planeación, evaluación e implantación de nuevas alternativas.",
            feedbackWrong: "El diseño implica planear, evaluar e implantar nuevas alternativas para el sistema."
          },
          {
            category: "diseno",
            question: "En el diseño de sistemas, el interés está puesto en...",
            options: [
              "Las sustancias y el contenido",
              "La estructura y los procesos, el método, el propósito y la función",
              "El origen de los materiales",
              "La antigüedad del sistema"
            ],
            answer: 1,
            feedbackCorrect: "¡Correcto! El diseño se interesa por la estructura y los procesos, el método, el propósito y la función.",
            feedbackWrong: "El interés del diseño son la estructura y los procesos, el método, el propósito y la función."
          },
          {
            category: "diseno",
            question: "En el diseño detallado de sistemas, la 'composición de las cosmovisiones de los clientes y planificadores' es...",
            options: [
              "Un paso del diseño",
              "Una frontera del sistema",
              "Un tipo de clasificación",
              "Una etapa del ciclo de vida"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Es uno de los pasos del diseño detallado de sistemas.",
            feedbackWrong: "Componer las cosmovisiones de clientes y planificadores es un paso del diseño de sistemas."
          },
          {
            category: "diseno",
            question: "¿Cuál de las siguientes acciones corresponde a un paso del diseño detallado de sistemas?",
            options: [
              "Identificar salidas, atributos, criterios, escalas de medición y modelos",
              "Sustituir al azar los componentes",
              "Eliminar toda medición del sistema",
              "Ocultar el propósito del sistema"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Identificar salidas, atributos, criterios, escalas y modelos es un paso del diseño.",
            feedbackWrong: "Ese paso identifica salidas, atributos, criterios, escalas de medición y modelos."
          },
          {
            category: "diseno",
            question: "El último paso del diseño detallado de sistemas consiste en...",
            options: [
              "La revisión y re-evaluación",
              "La compra de equipos",
              "La cancelación del proyecto",
              "El olvido del sistema"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El diseño termina con la revisión y re-evaluación.",
            feedbackWrong: "El diseño detallado concluye con la revisión y re-evaluación del sistema."
          },
          {
            category: "diseno",
            question: "El mejoramiento desintegra el gran problema en subproblemas mediante un proceso de reducción, mientras que el diseño...",
            options: [
              "Involucra la planeación, evaluación e implantación de nuevas alternativas para el sistema total",
              "Elimina el problema sin analizarlo",
              "Se enfoca solo en el pasado",
              "Reduce el sistema a un solo elemento"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! El diseño planea, evalúa e implanta nuevas alternativas para el sistema total.",
            feedbackWrong: "A diferencia del mejoramiento, el diseño involucra nuevas alternativas para el sistema total."
          },
          {
            category: "diseno",
            question: "El mejoramiento se aplica cuando...",
            options: [
              "El sistema ya existe y se busca optimizarlo",
              "El sistema aún no existe y se crea desde cero",
              "El sistema ya murió",
              "Ninguna, mejoramiento y diseño son idénticos"
            ],
            answer: 0,
            feedbackCorrect: "¡Correcto! Mejorar optimiza un sistema existente; diseñar crea nuevas alternativas.",
            feedbackWrong: "Mejorar actúa sobre un sistema que ya existe; diseñar es crear nuevas alternativas."
          }
        ]
      }
    ]
  };
  /* =========================================================
     2) STATE
     ========================================================= */
  const state = {
    scene: "title",          // title | intro | map | battle
    paused: false,
    data: null,              // gym1.json cargado
    zones: [],               // alias a data.zones
    playerMaxHp: 50,

    player: {
      x: 180, y: 590,
      hp: 50,
      bayas: 0,
      dir: "up",
      bob: 0,                // animación de paso
    },

    defeated: {},             // zoneId -> true
    sawIntro: false,

    // Entrada
    keys: {},                 // teclado
    dirActive: { up: false, down: false, left: false, right: false },

    // Mapa
    npcs: [],                 // {zone, x, y, w, h}
    nearNpc: null,

    // Diálogo
    dialogue: { active: false, lines: [], idx: 0, speaker: "", onDone: null },

    // Batalla
    battle: null,

    // Temporal
    now: 0,
    dt: 0,
    shake: 0,
  };

  // Referencias DOM
  const optilabResults = window.OptiLabResults?.create('OptiQuest1');
  const dom = {};

  /* =========================================================
     3) SAVE SYSTEM
     ========================================================= */
  const Save = {
    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          defeated: state.defeated,
          bayas: state.player.bayas,
          hp: state.player.hp,
          sawIntro: state.sawIntro,
          musicOn: Audio.musicOn,
        }));
      } catch (e) { /* localStorage no disponible: silencioso */ }
    },
    clear() {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    },
    hasProgress() {
      const s = Save.load();
      return !!(s && (s.sawIntro || Object.keys(s.defeated || {}).length || s.bayas));
    },
    apply(save) {
      if (!save) return;
      // Sanea progreso de versiones anteriores: solo cuenta zonas conocidas.
      state.defeated = {};
      for (const z of state.zones) {
        if (save.defeated && save.defeated[z.id]) state.defeated[z.id] = true;
      }
      state.player.bayas = save.bayas || 0;
      state.player.hp = save.hp || state.playerMaxHp;
      state.sawIntro = save.sawIntro || false;
      Audio.musicOn = save.musicOn !== false;
    }
  };

  /* =========================================================
     4) ASSET / AUDIO MANAGER
     Si los archivos no existen, no rompe: usa beeps WebAudio.
     ========================================================= */
  const Audio = {
    musicOn: true,
    ctx: null,
    current: null,            // nombre de música reproduciéndose
    els: {},                  // <audio> por nombre
    ready: false,

    init() {
      // Música y SFX como <audio>. Si no cargan, fallan en silencio.
      const make = (src, loop) => {
        const a = new window.Audio();
        a.src = src;
        a.loop = !!loop;
        a.preload = "auto";
        a.volume = 0.5;
        a.onerror = () => { /* sin asset: ok */ };
        return a;
      };
      this.els.mapMusic = make("assets/audio/map.mp3", true);
      this.els.battleMusic = make("assets/audio/battle.mp3", true);
      this.els.correctSfx = make("assets/audio/correct.mp3", false);
      this.els.wrongSfx = make("assets/audio/wrong.mp3", false);
      this.els.hitSfx = make("assets/audio/hit.mp3", false);
      this.els.victorySfx = make("assets/audio/victory.mp3", false);
      this.ready = true;
    },

    // Crea/reanuda AudioContext tras gesto del usuario (requerido en móvil).
    unlock() {
      try {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      } catch (e) { /* sin WebAudio: ok */ }
    },

    // Beep sintetizado (fallback cuando no hay archivo).
    beep(freq, dur, type, vol) {
      if (!this.musicOn) return;
      try {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type || "square";
        o.frequency.value = freq;
        g.gain.value = vol || 0.08;
        o.connect(g); g.connect(this.ctx.destination);
        const t = this.ctx.currentTime;
        o.start(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.stop(t + dur);
      } catch (e) {}
    },

    _playFile(name) {
      if (!this.musicOn) return;
      const el = this.els[name];
      if (!el) return;
      try {
        el.currentTime = 0;
        const p = el.play();
        if (p && p.catch) p.catch(() => {}); // archivo ausente o bloqueado
      } catch (e) {}
    },

    sfxCorrect() { this._playFile("correctSfx"); this.beep(880, 0.14, "square", 0.09); },
    sfxWrong()   { this._playFile("wrongSfx");   this.beep(160, 0.22, "sawtooth", 0.08); },
    sfxHit()     { this._playFile("hitSfx");     this.beep(420, 0.08, "square", 0.06); },
    sfxVictory() {
      this._playFile("victorySfx");
      this.beep(660, 0.12, "square", 0.09);
      setTimeout(() => this.beep(880, 0.18, "square", 0.09), 130);
    },

    playMusic(name) {
      if (!this.ready) return;
      if (this.current === name) return;
      this.stopMusic();
      this.current = name;
      if (!this.musicOn) return;
      // Chiptune procedural como música por defecto (sin archivos).
      // Si existe un archivo real y logra sonar, se silencia el chiptune.
      Chiptune.start(name);
      const el = this.els[name];
      if (el) {
        try {
          el.currentTime = 0;
          const p = el.play();
          if (p && p.then) {
            p.then(() => { Chiptune.stop(); })   // archivo real sonando
             .catch(() => { /* chiptune ya sonando */ });
          } else {
            Chiptune.stop();
          }
        } catch (e) {}
      }
    },

    stopMusic() {
      Chiptune.stop();
      for (const k in this.els) {
        if (k.indexOf("Music") !== -1) {
          const el = this.els[k];
          try { el.pause(); el.currentTime = 0; } catch (e) {}
        }
      }
      this.current = null;
    },

    applyMusicOn() {
      if (this.musicOn && this.current) {
        const name = this.current;
        this.current = null;            // forzar reinicio en playMusic
        this.playMusic(name);
      } else if (!this.musicOn) {
        this.stopMusic();
      }
    },

    toggle() {
      this.musicOn = !this.musicOn;
      this.applyMusicOn();
      Save.save();
      return this.musicOn;
    }
  };

  /* =========================================================
     4b) CHIPTUNE - música procedural (fallback sin assets)
     Dos temas: mapMusic (calma, C mayor) y battleMusic (rápido, A menor).
     Usa el mismo AudioContext del AudioManager.
     ========================================================= */
  const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const Chiptune = {
    timer: null,
    playing: null,
    idx: 0,

    themes: {
      mapMusic: {
        bpm: 108,
        melody: [72,0,76,0,79,0,76,0, 77,0,74,0,67,0,69,0,
                 72,0,67,0,64,0,67,0, 65,0,69,0,67,0, 0,0],
        bass:   [36,0,0,0,0,0,0,0, 43,0,0,0,0,0,0,0,
                 41,0,0,0,0,0,0,0, 40,0,0,0,0,0,0,0],
      },
      battleMusic: {
        bpm: 152,
        melody: [69,72,76,72, 69,72,76,72, 77,76,72,76, 74,72,69,0,
                 65,69,72,69, 65,69,72,69, 74,77,81,77, 76,72,69,0],
        bass:   [33,0,0,0, 33,0,0,0, 33,0,0,0, 33,0,0,0,
                 41,0,0,0, 41,0,0,0, 43,0,0,0, 43,0,0,0],
      }
    },

    ensureCtx() {
      if (!Audio.ctx) Audio.unlock();
      return !!Audio.ctx;
    },

    start(name) {
      const theme = this.themes[name];
      if (!theme) return;
      if (this.playing === name) return;
      this.stop();
      if (!this.ensureCtx()) return;
      this.playing = name;
      this.idx = 0;
      const stepMs = 60000 / theme.bpm / 4;   // semicorchea
      this._tick();
      this.timer = setInterval(() => this._tick(), stepMs);
    },

    _tick() {
      if (!this.playing || !Audio.ctx) return;
      const theme = this.themes[this.playing];
      const i = this.idx % theme.melody.length;
      const m = theme.melody[i];
      const b = theme.bass[i];
      if (m) this._note(NOTE(m), 0.20, "square", 0.05);
      if (b) this._note(NOTE(b), 0.42, "triangle", 0.07);
      this.idx++;
    },

    _note(freq, dur, type, vol) {
      try {
        const c = Audio.ctx;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.value = freq;
        o.connect(g); g.connect(c.destination);
        const t = c.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t);
        o.stop(t + dur + 0.03);
      } catch (e) {}
    },

    stop() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      this.playing = null;
      this.idx = 0;
    }
  };

  /* =========================================================
     5) INPUT MANAGER  (teclado + táctil)
     ========================================================= */
  const Input = {
    init() {
      // --- Teclado ---
      window.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter"].indexOf(k) !== -1) {
          e.preventDefault();
        }
        state.keys[k] = true;
        this._mapKey(k, true);

        if (k === " " || k === "enter") {
          Input.onAction();
        }
        if (k === "escape") {
          toggleMenu();
        }
      });
      window.addEventListener("keyup", (e) => {
        const k = e.key.toLowerCase();
        state.keys[k] = false;
        this._mapKey(k, false);
      });

      // --- D-pad táctil / ratón ---
      const dirButtons = dom.dpad.querySelectorAll(".dpad-btn[data-dir]");
      dirButtons.forEach((btn) => {
        const dir = btn.getAttribute("data-dir");
        const press = (e) => {
          e.preventDefault();
          state.dirActive[dir] = true;
          btn.classList.add("pressed");
          Audio.unlock();
        };
        const release = (e) => {
          e.preventDefault();
          state.dirActive[dir] = false;
          btn.classList.remove("pressed");
        };
        btn.addEventListener("pointerdown", press);
        btn.addEventListener("pointerup", release);
        btn.addEventListener("pointerleave", release);
        btn.addEventListener("pointercancel", release);
      });

      // Botón A
      const onA = (e) => {
        e.preventDefault();
        Audio.unlock();
        Input.onAction();
      };
      dom.btnA.addEventListener("pointerdown", onA);
    },

    _mapKey(k, down) {
      switch (k) {
        case "arrowup": case "w": state.dirActive.up = down; break;
        case "arrowdown": case "s": state.dirActive.down = down; break;
        case "arrowleft": case "a": state.dirActive.left = down; break;
        case "arrowright": case "d": state.dirActive.right = down; break;
      }
    },

    // Acción A / Espacio / Enter
    onAction() {
      if (state.scene === "map" && !state.dialogue.active && !state.paused) {
        tryInteract();
      } else if (state.dialogue.active) {
        nextDialogue();
      }
    }
  };

  /* =========================================================
     6) RENDER HELPERS  (Canvas 2D, pixel art con rects)
     ========================================================= */
  function ctx() { return dom.canvas.getContext("2d"); }

  function clearScene(bg) {
    const c = ctx();
    c.fillStyle = bg || C.panel;
    c.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // Caja RPG con borde grueso.
  function drawBox(x, y, w, h, fill, border) {
    const c = ctx();
    c.fillStyle = border || C.border;
    c.fillRect(x, y, w, h);
    c.fillStyle = fill || C.panel;
    c.fillRect(x + 3, y + 3, w - 6, h - 6);
    // esquinas claras
    c.fillStyle = "#cfe6ff";
    c.fillRect(x + 3, y + 3, 4, 4);
    c.fillRect(x + w - 7, y + 3, 4, 4);
    c.fillRect(x + 3, y + h - 7, 4, 4);
    c.fillRect(x + w - 7, y + h - 7, 4, 4);
  }

  // Texto con sombra (estilo retro).
  function drawText(text, x, y, size, color, align, font) {
    const c = ctx();
    c.font = (size || 12) + 'px ' + (font || '"VT323", monospace');
    c.textAlign = align || "left";
    c.textBaseline = "top";
    c.fillStyle = "rgba(0,0,0,0.6)";
    c.fillText(text, x + 1, y + 1);
    c.fillStyle = color || C.ink;
    c.fillText(text, x, y);
  }

  // Personaje pixelado (héroe / NPC). (x,y) = centro de los pies.
  function drawHero(x, y, bodyColor, dir, bob) {
    const c = ctx();
    const w = 16, h = 26;
    const px = Math.round(x - w / 2);
    const py = Math.round(y - h + (bob || 0));
    // sombra
    c.fillStyle = C.shadow;
    c.beginPath();
    c.ellipse(x, y + 1, 10, 4, 0, 0, Math.PI * 2);
    c.fill();
    // piernas
    c.fillStyle = C.heroLegs;
    c.fillRect(px + 3, py + 20, 4, 5);
    c.fillRect(px + 9, py + 20, 4, 5);
    // cuerpo
    c.fillStyle = bodyColor;
    c.fillRect(px + 2, py + 12, w - 4, 9);
    // brazos
    c.fillStyle = bodyColor;
    c.fillRect(px, py + 13, 3, 6);
    c.fillRect(px + w - 3, py + 13, 3, 6);
    // cabeza
    c.fillStyle = C.heroSkin;
    c.fillRect(px + 4, py + 2, 8, 9);
    // pelo
    c.fillStyle = "#3a2a1a";
    c.fillRect(px + 4, py + 1, 8, 3);
    c.fillRect(px + 3, py + 2, 1, 3);
    c.fillRect(px + 12, py + 2, 1, 3);
    // ojos según dirección
    c.fillStyle = "#1a1a2a";
    if (dir === "down") {
      c.fillRect(px + 6, py + 6, 2, 2);
      c.fillRect(px + 9, py + 6, 2, 2);
    } else if (dir === "up") {
      // sin ojos (espalda)
    } else if (dir === "left") {
      c.fillRect(px + 5, py + 6, 2, 2);
    } else {
      c.fillRect(px + 10, py + 6, 2, 2);
    }
  }

  // Enemigo pixelado (placeholder distinto por color/tamaño).
  function drawEnemy(x, y, color, size, t, flash) {
    const c = ctx();
    const s = size || 56;
    const bob = Math.sin(t * 4) * 3;
    const cx = Math.round(x);
    const cy = Math.round(y + bob);
    // sombra
    c.fillStyle = C.shadow;
    c.beginPath();
    c.ellipse(x, y + s / 2 + 6, s * 0.4, 6, 0, 0, Math.PI * 2);
    c.fill();
    // cuerpo
    c.fillStyle = flash ? "#ffffff" : color;
    c.fillRect(cx - s / 2, cy - s / 2, s, s);
    // borde oscuro
    c.fillStyle = "rgba(0,0,0,0.35)";
    c.fillRect(cx - s / 2, cy + s / 2 - 4, s, 4);
    c.fillRect(cx - s / 2, cy - s / 2, 4, s);
    // brillo
    c.fillStyle = "rgba(255,255,255,0.18)";
    c.fillRect(cx - s / 2 + 4, cy - s / 2 + 4, s - 12, 6);
    // ojos
    c.fillStyle = "#fff";
    c.fillRect(cx - s / 4, cy - 8, 9, 9);
    c.fillRect(cx + s / 4 - 9, cy - 8, 9, 9);
    c.fillStyle = "#1a1a2a";
    c.fillRect(cx - s / 4 + 2, cy - 5, 4, 4);
    c.fillRect(cx + s / 4 - 7, cy - 5, 4, 4);
    // boca
    c.fillStyle = "#1a1a2a";
    c.fillRect(cx - s / 5, cy + 8, (s / 5) * 2, 4);
    // colmillos
    c.fillStyle = "#fff";
    c.fillRect(cx - s / 5 + 2, cy + 12, 3, 3);
    c.fillRect(cx + s / 5 - 5, cy + 12, 3, 3);
  }

  // Barra de HP.
  function drawHpBar(x, y, w, h, ratio, labelLeft, labelRight) {
    const c = ctx();
    ratio = Math.max(0, Math.min(1, ratio));
    c.fillStyle = "#000";
    c.fillRect(x - 2, y - 2, w + 4, h + 4);
    c.fillStyle = "#2a2a3a";
    c.fillRect(x, y, w, h);
    c.fillStyle = ratio > 0.5 ? "#5ad06a" : ratio > 0.25 ? "#e0c33a" : "#e04a3a";
    c.fillRect(x, y, Math.round(w * ratio), h);
    // rayado
    c.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < w; i += 4) c.fillRect(x + i, y, 1, h);
    if (labelLeft) drawText(labelLeft, x, y - 13, 12, C.ink, "left");
    if (labelRight) drawText(labelRight, x + w, y - 13, 12, C.ink, "right");
  }

  /* =========================================================
     7) SCENE MANAGER
     ========================================================= */
  function showScene(name) {
    state.scene = name;
    // ocultar todos los overlays
    dom.titleScreen.classList.add("hidden");
    dom.introScreen.classList.add("hidden");
    dom.dialogue.classList.add("hidden");
    dom.mapControls.classList.add("hidden");
    dom.battleUi.classList.add("hidden");
    dom.menuScreen.classList.add("hidden");
    dom.resultScreen.classList.add("hidden");
    dom.topControls.classList.add("hidden");
    dom.battleFeedback.classList.add("hidden");

    switch (name) {
      case "title":
        dom.titleScreen.classList.remove("hidden");
        refreshTitleButtons();
        break;
      case "intro":
        dom.introScreen.classList.remove("hidden");
        break;
      case "map":
        dom.mapControls.classList.remove("hidden");
        dom.topControls.classList.remove("hidden");
        break;
      case "battle":
        dom.battleUi.classList.remove("hidden");
        dom.topControls.classList.remove("hidden");
        break;
    }
    updateMusicButton();
  }

  function refreshTitleButtons() {
    if (Save.hasProgress()) {
      dom.btnContinue.classList.remove("hidden");
    } else {
      dom.btnContinue.classList.add("hidden");
    }
  }

  function updateMusicButton() {
    const label = Audio.musicOn ? "Música: ON" : "Música: OFF";
    if (dom.btnTitleMusic) dom.btnTitleMusic.textContent = label;
    if (dom.btnMusic) dom.btnMusic.textContent = Audio.musicOn ? "♪" : "∅";
  }

  /* =========================================================
     8) TITLE SCENE
     ========================================================= */
  function startNewGame() {
    optilabResults?.start();
    Audio.unlock();
    state.sawIntro = false;
    state.player.bayas = 0;
    state.defeated = {};
    state.player.hp = state.playerMaxHp;
    Save.save();
    Audio.playMusic("mapMusic");
    startIntro();
  }

  function continueGame() {
    optilabResults?.start();
    Audio.unlock();
    const s = Save.load();
    Save.apply(s);
    resetPlayerToMap();
    Audio.playMusic("mapMusic");
    showScene("map");
  }

  /* =========================================================
     9) INTRO SCENE
     ========================================================= */
  const INTRO_LINES = [
    "Bienvenida al Gimnasio de Sistemas.",
    "Vencerás tres batallas de repaso: fundamentos, clasificación y delimitación, y evolución, mejoramiento y diseño.",
    "Explora el mapa, habla con los NPCs y responde bien las preguntas para atacar.",
    "¡Tu primera maestra te espera arriba! Toca A para interactuar."
  ];
  let introIdx = 0;

  function startIntro() {
    introIdx = 0;
    showScene("intro");
    renderIntroLine();
  }

  function renderIntroLine() {
    dom.introText.textContent = INTRO_LINES[introIdx];
    dom.btnIntroNext.textContent = introIdx < INTRO_LINES.length - 1 ? "Continuar ▸" : "Comenzar";
  }

  function introNext() {
    introIdx++;
    if (introIdx >= INTRO_LINES.length) {
      state.sawIntro = true;
      Save.save();
      resetPlayerToMap();
      showScene("map");
    } else {
      renderIntroLine();
    }
  }

  /* =========================================================
     10) MAP SCENE
     ========================================================= */
  function resetPlayerToMap() {
    // Posiciones de NPCs (top-down, el jugador parte abajo).
    state.npcs = state.zones.map((zone, i) => ({
      zone,
      x: i === 0 ? 180 : i === 1 ? 96 : 264,
      y: 150 + i * 150,
      w: 16, h: 26,
    }));
    state.player.x = 180;
    state.player.y = 590;
    state.player.dir = "up";
    state.player.hp = state.playerMaxHp;
    state.nearNpc = null;
  }

  function updateMap(dt) {
    if (state.dialogue.active || state.paused) return;

    let vx = 0, vy = 0;
    if (state.dirActive.up) vy -= 1;
    if (state.dirActive.down) vy += 1;
    if (state.dirActive.left) vx -= 1;
    if (state.dirActive.right) vx += 1;

    if (vx !== 0 || vy !== 0) {
      // normalizar diagonal
      const len = Math.hypot(vx, vy) || 1;
      vx = vx / len * MOVE_SPEED;
      vy = vy / len * MOVE_SPEED;
      // dirección (prioridad vertical si se mueve más)
      if (Math.abs(vy) >= Math.abs(vx)) {
        state.player.dir = vy < 0 ? "up" : "down";
      } else {
        state.player.dir = vx < 0 ? "left" : "right";
      }
      state.player.bob += dt * 12;

      const nx = state.player.x + vx;
      const ny = state.player.y + vy;
      // límites del lienzo (margen para no pisar marco)
      state.player.x = Math.max(14, Math.min(CANVAS_W - 14, nx));
      state.player.y = Math.max(30, Math.min(CANVAS_H - 24, ny));

      // colisión suave con NPCs (no atravesarlos)
      for (const npc of state.npcs) {
        const d = Math.hypot(state.player.x - npc.x, state.player.y - npc.y);
        if (d < 20) {
          // empujar al jugador fuera
          const ang = Math.atan2(state.player.y - npc.y, state.player.x - npc.x);
          state.player.x = npc.x + Math.cos(ang) * 20;
          state.player.y = npc.y + Math.sin(ang) * 20;
        }
      }
    } else {
      state.player.bob = 0;
    }

    // NPC cercano
    state.nearNpc = null;
    let best = INTERACT_RANGE;
    for (const npc of state.npcs) {
      const d = Math.hypot(state.player.x - npc.x, state.player.y - npc.y);
      if (d < best) { best = d; state.nearNpc = npc; }
    }
  }

  function renderMap() {
    const c = ctx();
    clearScene(C.grassA);
    // pasto con patrón de tablero
    for (let ty = 0; ty < CANVAS_H; ty += TILE) {
      for (let tx = 0; tx < CANVAS_W; tx += TILE) {
        c.fillStyle = ((tx / TILE + ty / TILE) % 2 === 0) ? C.grassA : C.grassB;
        c.fillRect(tx, ty, TILE, TILE);
      }
    }
    // camino vertical central
    drawPath(150, 0, 60, CANVAS_H);
    // ramas del camino hacia cada NPC lateral
    drawPath(96, 294, 90, 12);    // rama hacia NPC2 (izq)
    drawPath(180, 444, 90, 12);   // rama hacia NPC3 (der)

    // árboles decorativos (no bloquean, van al borde)
    drawTree(40, 70);
    drawTree(320, 110);
    drawTree(60, 420);
    drawTree(300, 350);
    drawTree(40, 560);
    drawTree(320, 600);

    // flores / detalles
    drawFlower(120, 500, "#ff7ab0");
    drawFlower(250, 250, "#ffd24a");
    drawFlower(200, 420, "#7ab0ff");

    // NPCs
    for (const npc of state.npcs) {
      const defeated = !!state.defeated[npc.zone.id];
      drawHero(npc.x, npc.y, npc.zone.mapColor, "down", 0);
      // etiqueta
      drawText(npc.zone.npc, npc.x, npc.y - 42, 8, C.ink, "center", '"Press Start 2P", monospace');
      // indicador
      if (defeated) {
        drawText("✔", npc.x + 14, npc.y - 44, 14, C.accent, "center");
      } else if (state.nearNpc === npc) {
        // flecha flotante
        const fy = npc.y - 52 + Math.sin(state.now * 5) * 2;
        c.fillStyle = C.gold;
        c.beginPath();
        c.moveTo(npc.x, fy + 6);
        c.lineTo(npc.x - 5, fy);
        c.lineTo(npc.x + 5, fy);
        c.closePath();
        c.fill();
        // aviso "Pulsa A"
        drawText("PULSA A", npc.x, npc.y - 66, 8, C.gold, "center", '"Press Start 2P", monospace');
      }
    }

    // jugador
    const bobAmt = Math.sin(state.player.bob) * 1;
    drawHero(state.player.x, state.player.y, C.heroBody, state.player.dir, bobAmt);

    // cartel superior con progreso
    drawTopHud();
  }

  function drawTopHud() {
    // Debajo de los botones superiores (música/menú) para no taparlos.
    drawBox(8, 48, CANVAS_W - 16, 26, "rgba(15,20,36,0.85)", C.borderDark);
    const defeatedCount = Object.keys(state.defeated).length;
    drawText("🫐 " + state.player.bayas, 18, 55, 15, C.ink, "left");
    drawText("Gimnasio: " + defeatedCount + "/3", CANVAS_W / 2, 55, 15, C.ink, "center");
    drawText("♥ " + state.player.hp, CANVAS_W - 18, 55, 15, "#ff8a8a", "right");
  }

  function drawPath(x, y, w, h) {
    const c = ctx();
    c.fillStyle = C.path;
    c.fillRect(x, y, w, h);
    c.fillStyle = C.pathEdge;
    c.fillRect(x, y, w, 3);
    c.fillRect(x, y + h - 3, w, 3);
  }

  function drawTree(x, y) {
    const c = ctx();
    // tronco
    c.fillStyle = C.trunk;
    c.fillRect(x - 4, y + 12, 8, 10);
    // copa
    c.fillStyle = C.tree;
    c.fillRect(x - 12, y - 6, 24, 22);
    c.fillStyle = C.treeLight;
    c.fillRect(x - 8, y - 4, 14, 8);
    c.fillStyle = "rgba(255,255,255,0.08)";
    c.fillRect(x - 10, y - 5, 4, 4);
  }

  function drawFlower(x, y, color) {
    const c = ctx();
    c.fillStyle = color;
    c.fillRect(x - 1, y - 1, 3, 3);
    c.fillStyle = "#ffe88a";
    c.fillRect(x, y, 1, 1);
  }

  function tryInteract() {
    if (!state.nearNpc) return;
    const npc = state.nearNpc;
    const zone = npc.zone;
    if (state.defeated[zone.id]) {
      startDialogue(zone.npc, zone.victoryDialogue || ["¡Ya dominas este tema!"], null);
    } else {
      startDialogue(zone.npc, zone.dialogue, () => startBattle(zone));
    }
  }

  /* =========================================================
     11) DIALOGUE SYSTEM
     ========================================================= */
  function startDialogue(speaker, lines, onDone) {
    state.dialogue.active = true;
    state.dialogue.lines = lines;
    state.dialogue.idx = 0;
    state.dialogue.speaker = speaker;
    state.dialogue.onDone = onDone || null;
    dom.dialogue.classList.remove("hidden");
    renderDialogue();
  }

  function renderDialogue() {
    dom.dialogueSpeaker.textContent = state.dialogue.speaker;
    dom.dialogueText.textContent = state.dialogue.lines[state.dialogue.idx];
    const last = state.dialogue.idx >= state.dialogue.lines.length - 1;
    dom.btnDialogueNext.textContent = last ? (state.dialogue.onDone ? "¡Batalla!" : "Cerrar") : "Continuar ▸";
  }

  function nextDialogue() {
    if (!state.dialogue.active) return;
    state.dialogue.idx++;
    if (state.dialogue.idx >= state.dialogue.lines.length) {
      closeDialogue();
      const cb = state.dialogue.onDone;
      state.dialogue.onDone = null;
      if (cb) cb();
    } else {
      renderDialogue();
    }
  }

  function closeDialogue() {
    state.dialogue.active = false;
    dom.dialogue.classList.add("hidden");
  }

  /* =========================================================
     12) BATTLE SCENE
     ========================================================= */
  // Selección por categorías: garantiza que cada bloque temático tenga
  // cabida en la partida, sin repetir preguntas de forma inmediata.
  function buildBattlePlaylist(questions, poolSize) {
    const groups = [];
    const byCat = new Map();
    questions.forEach((q) => {
      const cat = q.category || "general";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(q);
    });
    byCat.forEach((qs) => {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = qs[i]; qs[i] = qs[j]; qs[j] = tmp;
      }
      groups.push(qs);
    });
    for (let i = groups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = groups[i]; groups[i] = groups[j]; groups[j] = tmp;
    }
    const playlist = [];
    let idx = 0;
    let added = true;
    while (playlist.length < poolSize && added) {
      added = false;
      for (const qs of groups) {
        if (idx < qs.length && playlist.length < poolSize) {
          playlist.push(qs[idx]);
          added = true;
        }
      }
      idx++;
    }
    return playlist;
  }

  function startBattle(zone) {
    state.battle = {
      zone,
      enemyName: zone.enemy.name,
      enemyColor: zone.enemy.color,
      enemyHp: zone.enemy.hp,
      enemyMaxHp: zone.enemy.hp,
      questions: buildBattlePlaylist(zone.questions, BATTLE_POOL[zone.id] || 8),
      qIdx: 0,
      playerHp: state.playerMaxHp,
      playerMaxHp: state.playerMaxHp,
      phase: "question",      // question | feedback | ended
      feedback: "",
      lastCorrect: false,
      animTimer: 0,
      animType: null,         // "player" | "enemy" | null
      enemyFlash: 0,
      playerFlash: 0,
      result: null,           // "win" | "lose"
    };
    state.player.hp = state.playerMaxHp;
    showScene("battle");
    Audio.playMusic("battleMusic");
    renderBattleQuestion();
  }

  function renderBattleQuestion() {
    const b = state.battle;
    if (!b) return;
    const q = b.questions[b.qIdx % b.questions.length];
    dom.battleQuestion.textContent = q.question;
    const keys = ["A", "B", "C", "D"];
    const btns = dom.battleUi.querySelectorAll(".answer-btn");
    btns.forEach((btn, i) => {
      btn.innerHTML = '<span class="opt-key">' + keys[i] + "</span> " + (q.options[i] || "");
      btn.classList.remove("correct-opt", "wrong-opt");
      btn.disabled = false;
    });
    dom.battleAnswers.classList.remove("hidden");
    dom.battleFeedback.classList.add("hidden");
  }

  function onAnswer(i) {
    const b = state.battle;
    if (!b || b.phase !== "question") return;
    const q = b.questions[b.qIdx % b.questions.length];
    const correct = i === q.answer;
    b.lastCorrect = correct;

    // marcar opción elegida
    const btns = dom.battleUi.querySelectorAll(".answer-btn");
    btns.forEach((bb) => (bb.disabled = true));
    if (btns[i]) btns[i].classList.add(correct ? "correct-opt" : "wrong-opt");
    if (!correct && btns[q.answer]) btns[q.answer].classList.add("correct-opt");

    if (correct) {
      b.enemyHp = Math.max(0, b.enemyHp - DMG_TO_ENEMY);
      b.feedback = q.feedbackCorrect;
      b.animType = "player";
      Audio.sfxCorrect();
      setTimeout(() => Audio.sfxHit(), 90);
    } else {
      b.playerHp = Math.max(0, b.playerHp - DMG_TO_PLAYER);
      b.feedback = q.feedbackWrong;
      b.animType = "enemy";
      Audio.sfxWrong();
      setTimeout(() => Audio.sfxHit(), 90);
      state.shake = 0.35;
    }
    b.enemyFlash = correct ? 0.18 : 0;
    b.playerFlash = correct ? 0 : 0.18;
    b.animTimer = ANIM_DUR;
    b.phase = "feedback";
    showFeedback(correct, b.feedback);
  }

  function showFeedback(correct, text) {
    dom.battleAnswers.classList.add("hidden");
    dom.battleFeedback.classList.remove("hidden");
    dom.feedbackText.textContent = text;
    dom.feedbackText.className = "feedback-text " + (correct ? "correct" : "wrong");
    const b = state.battle;
    let nextLabel = "Continuar ▸";
    if (b.enemyHp <= 0) nextLabel = "Resultado ▸";
    else if (b.playerHp <= 0) nextLabel = "Resultado ▸";
    dom.btnFeedbackNext.textContent = nextLabel;
  }

  function onFeedbackNext() {
    const b = state.battle;
    if (!b) return;
    if (b.enemyHp <= 0) { endBattle(true); return; }
    if (b.playerHp <= 0) { endBattle(false); return; }
    b.qIdx++;
    b.phase = "question";
    b.animType = null;
    renderBattleQuestion();
  }

  function endBattle(won) {
    const b = state.battle;
    b.phase = "ended";
    b.result = won ? "win" : "lose";
    if (won) {
      state.defeated[b.zone.id] = true;
      state.player.bayas += 1;
      Audio.sfxVictory();
      Save.save();
      showResult(true);
    } else {
      showResult(false);
    }
  }

  function showResult(won) {
    const b = state.battle;
    dom.resultTitle.textContent = won ? "¡Victoria!" : "Derrota";
    dom.resultTitle.style.color = won ? C.accent : "#ff7a7a";
    if (won) {
      const total = Object.keys(state.defeated).length;
      const complete = total >= state.zones.length;
      if (complete) optilabResults?.complete({reason:'completed',correct:total,total:state.zones.length});
      dom.resultText.textContent = complete
        ? "¡Ganaste una baya y completaste el Gimnasio de Sistemas! Eres una Maestra de Sistemas. 🫐"
        : "¡Ganaste una baya! 🫐 Progreso guardado.";
      dom.btnResult.textContent = "Volver al mapa";
      dom.btnResultMap.classList.add("hidden");
    } else {
      dom.resultText.textContent = "No fue esta vez. Repasa los conceptos y vuelve a intentarlo. 💪";
      dom.btnResult.textContent = "Reintentar batalla";
      dom.btnResultMap.classList.remove("hidden");
    }
    dom.resultScreen.classList.remove("hidden");
  }

  function onResultButton() {
    const b = state.battle;
    if (b && b.result === "win") {
      returnToMap();
    } else if (b && b.result === "lose") {
      // reintentar misma batalla
      dom.resultScreen.classList.add("hidden");
      const zone = b.zone;
      state.battle = null;
      startBattle(zone);
    }
  }

  function onResultMap() {
    returnToMap();
  }

  function returnToMap() {
    dom.resultScreen.classList.add("hidden");
    state.battle = null;
    resetPlayerToMap();
    Save.save();
    Audio.playMusic("mapMusic");
    showScene("map");
  }

  function updateBattle(dt) {
    const b = state.battle;
    if (!b) return;
    if (b.animTimer > 0) {
      b.animTimer = Math.max(0, b.animTimer - dt);
      if (b.animTimer === 0) { b.animType = null; }
    }
    if (b.enemyFlash > 0) b.enemyFlash = Math.max(0, b.enemyFlash - dt);
    if (b.playerFlash > 0) b.playerFlash = Math.max(0, b.playerFlash - dt);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
  }

  function renderBattle() {
    const b = state.battle;
    if (!b) return;
    const c = ctx();
    clearScene("#241a2e");

    // shake
    let sx = 0, sy = 0;
    if (state.shake > 0) {
      sx = (Math.random() - 0.5) * 6 * state.shake;
      sy = (Math.random() - 0.5) * 6 * state.shake;
    }
    c.save();
    c.translate(sx, sy);

    // fondo de batalla
    c.fillStyle = "#2a1f3a";
    c.fillRect(0, 0, CANVAS_W, 430);
    c.fillStyle = "#1a1430";
    c.fillRect(0, 300, CANVAS_W, 130);
    // estrellas
    c.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 30; i++) {
      const px = (i * 53) % CANVAS_W;
      const py = (i * 37) % 300;
      c.fillRect(px, py, 2, 2);
    }

    // --- Caja de info del enemigo (arriba, centrada para no tapar los
    //     botones de música/menú que están en las esquinas superiores) ---
    drawBox(54, 14, 252, 44, C.panel, C.border);
    drawText(b.enemyName, 62, 20, 9, C.ink, "left", '"Press Start 2P", monospace');
    drawHpBar(62, 40, 180, 8, b.enemyHp / b.enemyMaxHp);
    drawText(b.enemyHp + "/" + b.enemyMaxHp, 298, 37, 13, C.ink, "right");

    // --- Enemigo (centro-arriba) ---
    const enemySize = 64 + Math.min(20, b.enemyMaxHp - 30);
    const ex = 180, ey = 150;
    let eOffsetX = 0;
    if (b.animType === "player") {
      const p = 1 - b.animTimer / ANIM_DUR;
      eOffsetX = Math.sin(p * Math.PI) * 12;
    }
    // plataforma enemigo
    c.fillStyle = "rgba(0,0,0,0.3)";
    c.beginPath();
    c.ellipse(ex, 195, 70, 14, 0, 0, Math.PI * 2);
    c.fill();
    drawEnemy(ex + eOffsetX, ey, b.enemyColor, enemySize, state.now, b.enemyFlash > 0);
    // slash sobre el enemigo al acertar
    if (b.enemyFlash > 0 && b.animType === "player") {
      c.strokeStyle = "#ffffff";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(ex + eOffsetX - 22, ey - 22);
      c.lineTo(ex + eOffsetX + 22, ey + 22);
      c.moveTo(ex + eOffsetX + 22, ey - 22);
      c.lineTo(ex + eOffsetX - 22, ey + 22);
      c.stroke();
    }

    // --- Jugador (centro-abajo) ---
    let pOffsetY = 0;
    if (b.animType === "player") {
      const p = 1 - b.animTimer / ANIM_DUR;
      pOffsetY = -Math.sin(p * Math.PI) * 14; // salto al atacar
    } else if (b.animType === "enemy") {
      const p = 1 - b.animTimer / ANIM_DUR;
      pOffsetY = Math.sin(p * Math.PI) * 10;  // retroceso al recibir
    }
    // plataforma jugador
    c.fillStyle = "rgba(0,0,0,0.3)";
    c.beginPath();
    c.ellipse(180, 342, 60, 12, 0, 0, Math.PI * 2);
    c.fill();
    // flash rojo al recibir daño
    if (b.playerFlash > 0) {
      c.fillStyle = "rgba(255,80,80," + Math.min(0.6, b.playerFlash * 3) + ")";
      c.fillRect(150, 305 + pOffsetY, 60, 50);
    }
    drawHero(180, 340 + pOffsetY, C.heroBody, "up", 0);

    // --- Caja de info del jugador (debajo del sprite, sobre el overlay) ---
    drawBox(10, 360, 340, 46, C.panel, C.border);
    drawText("Aprendiz", 18, 366, 10, C.ink, "left", '"Press Start 2P", monospace');
    drawHpBar(18, 386, 250, 8, b.playerHp / b.playerMaxHp);
    drawText(b.playerHp + "/" + b.playerMaxHp, 338, 383, 14, C.ink, "right");

    c.restore();

    // La zona inferior (preguntas/feedback) la pinta el HTML overlay (#battle-ui).
  }

  /* =========================================================
     13) RESULT / MENU
     ========================================================= */
  function toggleMenu() {
    if (state.scene !== "map" && state.scene !== "battle") return;
    if (state.dialogue.active) return;
    state.paused = !state.paused;
    if (state.paused) {
      dom.menuBayas.textContent = state.player.bayas;
      dom.menuProgress.textContent = Object.keys(state.defeated).length + " / " + state.zones.length;
      dom.menuScreen.classList.remove("hidden");
    } else {
      dom.menuScreen.classList.add("hidden");
    }
  }

  function resetProgress() {
    optilabResults?.cancel();
    Save.clear();
    state.defeated = {};
    state.player.bayas = 0;
    state.player.hp = state.playerMaxHp;
    state.sawIntro = false;
    state.paused = false;
    dom.menuScreen.classList.add("hidden");
    Audio.stopMusic();
    showScene("title");
  }

  /* =========================================================
     14) MAIN LOOP
     ========================================================= */
  function loop(t) {
    const now = t / 1000;
    state.dt = Math.min(0.05, now - (state.now || now));
    state.now = now;

    if (!state.paused) {
      if (state.scene === "map") updateMap(state.dt);
      else if (state.scene === "battle") updateBattle(state.dt);
    }

    // render
    if (state.scene === "title") renderTitleCanvas();
    else if (state.scene === "intro") renderIntroCanvas();
    else if (state.scene === "map") renderMap();
    else if (state.scene === "battle") renderBattle();

    requestAnimationFrame(loop);
  }

  // Fondo del lienzo en título/intro (decorativo detrás del overlay).
  function renderTitleCanvas() {
    const c = ctx();
    clearScene("#0e1326");
    // estrellas
    c.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 40; i++) {
      const x = (i * 67) % CANVAS_W;
      const y = (i * 41) % CANVAS_H;
      const s = (i % 3) + 1;
      c.fillRect(x, y, s, s);
    }
    // "pasto" inferior
    c.fillStyle = "#1f4a26";
    c.fillRect(0, CANVAS_H - 80, CANVAS_W, 80);
    c.fillStyle = "#2c6a36";
    for (let x = 0; x < CANVAS_W; x += 16) c.fillRect(x, CANVAS_H - 80, 8, 6);
    // pequeño héroe caminando en el lugar
    drawHero(180, CANVAS_H - 30, C.heroBody, "down", Math.sin(state.now * 4) * 1);
  }

  function renderIntroCanvas() {
    const c = ctx();
    clearScene("#16203a");
    // silueta de mentora
    drawHero(180, 330, "#b048b0", "down", 0);
    c.fillStyle = "rgba(0,0,0,0.4)";
    c.beginPath();
    c.ellipse(180, 340, 90, 14, 0, 0, Math.PI * 2);
    c.fill();
  }

  /* =========================================================
     15) BOOT
     ========================================================= */
  function cacheDom() {
    dom.canvas = document.getElementById("game");
    dom.container = document.getElementById("game-container");
    dom.titleScreen = document.getElementById("title-screen");
    dom.introScreen = document.getElementById("intro-screen");
    dom.btnStart = document.getElementById("btn-start");
    dom.btnContinue = document.getElementById("btn-continue");
    dom.btnTitleMusic = document.getElementById("btn-title-music");
    dom.introText = document.getElementById("intro-text");
    dom.btnIntroNext = document.getElementById("btn-intro-next");
    dom.topControls = document.getElementById("top-controls");
    dom.btnMusic = document.getElementById("btn-music");
    dom.btnMenu = document.getElementById("btn-menu");
    dom.dialogue = document.getElementById("dialogue");
    dom.dialogueSpeaker = document.getElementById("dialogue-speaker");
    dom.dialogueText = document.getElementById("dialogue-text");
    dom.btnDialogueNext = document.getElementById("btn-dialogue-next");
    dom.mapControls = document.getElementById("map-controls");
    dom.dpad = document.getElementById("dpad");
    dom.btnA = document.getElementById("btn-a");
    dom.battleUi = document.getElementById("battle-ui");
    dom.battleAnswers = document.getElementById("battle-answers");
    dom.battleFeedback = document.getElementById("battle-feedback");
    dom.battleQuestion = document.getElementById("battle-question");
    dom.feedbackText = document.getElementById("feedback-text");
    dom.btnFeedbackNext = document.getElementById("btn-feedback-next");
    dom.menuScreen = document.getElementById("menu-screen");
    dom.menuBayas = document.getElementById("menu-bayas");
    dom.menuProgress = document.getElementById("menu-progress");
    dom.btnResume = document.getElementById("btn-resume");
    dom.btnReset = document.getElementById("btn-reset");
    dom.btnMenuTitle = document.getElementById("btn-menu-title");
    dom.resultScreen = document.getElementById("result-screen");
    dom.resultTitle = document.getElementById("result-title");
    dom.resultText = document.getElementById("result-text");
    dom.btnResult = document.getElementById("btn-result");
    dom.btnResultMap = document.getElementById("btn-result-map");
  }

  function bindUi() {
    dom.btnStart.addEventListener("click", startNewGame);
    dom.btnContinue.addEventListener("click", continueGame);
    dom.btnTitleMusic.addEventListener("click", () => { Audio.unlock(); Audio.toggle(); updateMusicButton(); });
    dom.btnIntroNext.addEventListener("click", introNext);
    dom.btnDialogueNext.addEventListener("click", nextDialogue);
    dom.btnMusic.addEventListener("click", () => { Audio.unlock(); Audio.toggle(); updateMusicButton(); });
    dom.btnMenu.addEventListener("click", toggleMenu);

    // botones de respuesta
    dom.battleUi.querySelectorAll(".answer-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-i"), 10);
        onAnswer(i);
      });
    });
    dom.btnFeedbackNext.addEventListener("click", onFeedbackNext);

    // menú
    dom.btnResume.addEventListener("click", toggleMenu);
    dom.btnReset.addEventListener("click", resetProgress);
    dom.btnMenuTitle.addEventListener("click", () => {
      optilabResults?.cancel();
      state.paused = false;
      dom.menuScreen.classList.add("hidden");
      Audio.stopMusic();
      showScene("title");
    });

    // resultado
    dom.btnResult.addEventListener("click", onResultButton);
    dom.btnResultMap.addEventListener("click", onResultMap);

    // escalado responsive
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", () => setTimeout(fit, 200));
  }

  // Escala el contenedor 360x640 al viewport manteniendo proporción.
  function fit() {
    const margin = 6;
    const s = Math.min(
      (window.innerWidth - margin) / CANVAS_W,
      (window.innerHeight - margin) / CANVAS_H
    );
    dom.container.style.transform = "scale(" + s + ")";
  }

  function loadData(cb) {
    fetch(DATA_URL, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => cb(data))
      .catch(() => cb(FALLBACK_DATA));
  }

  function boot() {
    cacheDom();
    bindUi();
    fit();
    Audio.init();

    // restaura preferencia de música guardada (sin reproducir todavía)
    const saved = Save.load();
    if (saved && saved.musicOn === false) Audio.musicOn = false;
    updateMusicButton();

    loadData((data) => {
      state.data = data;
      state.zones = data.zones || [];
      state.playerMaxHp = (data.player && data.player.maxHp) || 50;
      state.player.hp = state.playerMaxHp;
      refreshTitleButtons();
      showScene("title");
      Input.init();
      requestAnimationFrame(loop);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

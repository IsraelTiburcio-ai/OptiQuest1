# OptiQuest: Gimnasio de Sistemas

Mini RPG educativo (MVP) sobre la **Teoría General de Sistemas**, basado en el
Gimnasio 1 de Optimización I / Teoría de Sistemas.

**Actividad de refuerzo:** el banco de preguntas cubre los temas trabajados en
el Gimnasio 1, páginas 4-13 (hasta Diseño de Sistemas). No incluye Complejidad
(1.4) ni Investigación de Operaciones (1.6), que se tratan después.

Juego de exploración top-down + batallas por turnos con preguntas. Mobile-first
vertical, retro pixel art, hecho con **HTML + CSS + JavaScript puro + Canvas 2D**.
Sin frameworks, sin backend, sin base de datos.

## Pantallas

1. **Título** — Iniciar aventura / Continuar / Música ON-OFF.
2. **Intro narrativa** — mentora explica el objetivo.
3. **Mapa** — exploración con D-pad táctil o WASD/flechas, 3 NPCs.
4. **Diálogo** — caja retro, avanza con Continuar.
5. **Batalla** — enemigo arriba, jugador centro, pregunta + 4 respuestas abajo.
   - Correcta → daño al enemigo. Incorrecta → el enemigo te daña.
   - Al vencer: ganas una 🫐 baya y se guarda el progreso.
   - Al perder: puedes reintentar la batalla.

## Controles

| Acción | Móvil | Escritorio |
|---|---|---|
| Mover | D-pad abajo izquierda | `WASD` / Flechas |
| Interactuar / avanzar | Botón **A** abajo derecha | `Espacio` / `Enter` |
| Pausa | Botón `II` arriba derecha | `Esc` |
| Música | Botón `♪` arriba izquierda | Botón `♪` |

> La música **sólo inicia tras tocar "Iniciar aventura"** (restricción de los
> navegadores móviles). Si no hay archivos de audio, el juego funciona
> silenciosamente y usa beeps sintetizados de respaldo para los efectos.

## Estructura

```
optiquest/
  index.html        # UI y overlays
  styles.css        # estilo retro pixel, responsive
  app.js            # toda la lógica (secciones comentadas)
  data/
    gym1.json       # 3 zonas, 3 enemigos, 53 preguntas
  assets/
    img/            # (opcional) sprites PNG — el MVP usa placeholders Canvas
    audio/          # (opcional) map.mp3, battle.mp3, correct.mp3, wrong.mp3, hit.mp3, victory.mp3
```

### Zonas y selección por categorías

| Zona | NPC | Temas (páginas 4-13) |
|---|---|---|
| Fundamentos del Sistema | Profa Sistemas | definición, elementos y relaciones, propósito, entrada, proceso, salida, retroalimentación, medio ambiente, objeto/sujeto/concepto |
| Clasificar y Delimitar | Guardián de Fronteras | clasificación (viviente/no viviente, abstracto/concreto, abierto/cerrado, estático/dinámico/homeostático), subsistema/suprasistema, fronteras (física, económica, técnica, temporal) |
| Evolución, Mejoramiento y Diseño | Líder del Gimnasio | ciclo de vida (nacimiento, crecimiento, evolución gradual, estabilidad, muerte), mejoramiento vs. diseño, pasos del diseño detallado |

Cada batalla selecciona aleatoriamente un subconjunto del banco, **garantizando
cobertura por categorías** (cada bloque temático aparece en la partida) sin
alargar el juego: sigue bastando con 3/4/5 aciertos para vencer (30/40/50 HP).
La lógica está en `buildBattlePlaylist()` en `app.js`.

### Contenido editable (`data/gym1.json`)

Cada zona tiene: `id`, `title`, `npc`, `mapColor`, `dialogue` (pre-batalla),
`victoryDialogue` (al revisitar NPC vencido), `enemy` (`name`, `hp`, `color`) y
`questions` (con `category` para la selección por bloques, `options`, `answer`
índice 0-3, `feedbackCorrect`, `feedbackWrong`). Edita ese archivo para cambiar
preguntas/enemigos sin tocar código. Si el fetch del JSON falla (p. ej. abrir
con `file://`), `app.js` lleva unos datos embebidos de respaldo y el juego sigue
funcionando.

### Sustituir placeholders por assets reales

- **Sprites**: el MVP dibuja personajes/enemigos con rects en Canvas. Para usar
  PNGs, guarda las imágenes en `assets/img/` y reemplaza las llamadas a
  `drawHero`/`drawEnemy` en `app.js` por `ctx.drawImage(...)`.
- **Audio**: deja archivos con estos nombres exactos en `assets/audio/`:
  `map.mp3`, `battle.mp3`, `correct.mp3`, `wrong.mp3`, `hit.mp3`,
  `victory.mp3`. Si faltan, el juego no se rompe (usa beeps WebAudio).

## Guardado

El progreso se guarda en `localStorage` (`optiquest_save_v1`): NPCs derrotados,
bayas, HP, preferencia de música y si ya vio la intro. "Reiniciar progreso" (en
Pausa) borra el guardado.

## Cómo correrlo localmente

Por el fetch del JSON, usa un servidor estático (no abras el `.html` directamente
con `file://`, aunque funcionaría por el fallback embebido):

```bash
cd optiquest
# Python 3
python3 -m http.server 8000
# luego abre http://localhost:8000
```

Otras opciones:

```bash
npx serve .           # Node
# o con PHP
php -S localhost:8000
```

## Publicar en GitHub Pages

1. Crea un repo y copia la carpeta `optiquest/` en la raíz (o usa la raíz del
   repo como contenido).
2. Sube los archivos (`git push`).
3. En el repo: **Settings → Pages → Source: Deploy from a branch**, elige la
   rama (`main`) y carpeta (`/root` o `/docs` según dónde lo pongas).
4. Abre la URL que te da Pages (`https://usuario.github.io/repo/`).

> Si el juego no queda en la raíz del repo (p. ej. está en `/optiquest`), la URL
> será `https://usuario.github.io/repo/optiquest/`. Las rutas relativas
> (`data/gym1.json`, `assets/...`) funcionan igual.

## Stack y restricciones

- HTML, CSS, JS puro, Canvas 2D, JSON, localStorage.
- Sin React, sin Phaser, sin backend, sin base de datos, sin librerías pesadas.
- Resolución base **360×640**, escalada responsive con `transform: scale()`,
  `image-rendering: pixelated`.
- Funciona en celular vertical, tablet y escritorio (no se pide rotar el móvil).
- Identidad original; no usa assets ni nombres de franquicias externas.

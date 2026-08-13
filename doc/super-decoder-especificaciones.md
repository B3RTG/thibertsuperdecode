# Super Decoder Web — Especificaciones de implementación

> App web en **React** que recrea el juego de romper códigos *GiiKER Super Decoder*, respetando sus reglas y con una estética **moderna inspirada** (no réplica) en la consola física. Modo **1 y 2 jugadores**, dos niveles de dificultad (fácil / avanzado) y una **capa de entrada intercambiable** (paleta táctil, mando giratorio y teclado) sobre una única lógica de juego.

Este documento está pensado para usarse como guía en una sesión de **Claude Code**. Está ordenado para que se pueda implementar por fases sin ambigüedad, con especial cuidado en la parte más delicada: el algoritmo de evaluación de intentos con colores repetidos.

---

## 1. Objetivo y alcance

- Recrear el bucle de juego del Super Decoder: adivinar un código de 4 colores en un número limitado de intentos usando pistas.
- **Sin backend.** Todo corre en el cliente. La persistencia es local (`localStorage`).
- Soporte de **1 jugador** (la app genera el código) y **2 jugadores** (un jugador define el código, el otro adivina; modo "pasar y jugar").
- Dos modos de dificultad que **se diferencian solo en cómo se muestran las pistas**, no en cómo se calculan.
- Tres formas de entrada que conviven sobre las mismas acciones: **paleta**, **mando giratorio** y **teclado**.
- Estética moderna con guiños retro (LEDs con glow, mando naranja, display de nivel, beeps opcionales).

**Fuera de alcance (v1):** cuentas de usuario, multijugador online, backend, i18n completo (se deja el texto centralizado por si acaso).

---

## 2. Stack técnico

- **React 18+** con Vite como bundler.
- JavaScript o TypeScript — **se recomienda TypeScript** por la lógica de estado; si se prefiere JS, respetar las formas de datos de la sección 8.
- Estado con **`useReducer`** (máquina de estados). Sin librería de estado externa.
- Estilos: **CSS Modules** o Tailwind (a elección; los tokens de la sección 11 valen para ambos). Evitar dependencias pesadas.
- Sonido: **Web Audio API** (o `<audio>` con ficheros cortos). Con toggle de silencio.
- Sin router necesario (las "pantallas" son fases de estado); si se usa router, que sea mínimo.

> Nota: si en algún momento se prueba dentro de un artifact de Claude, `localStorage` no está disponible allí; en un despliegue web normal funciona sin problema. La persistencia debe estar aislada tras un hook (`usePersistence`) para poder desactivarla fácilmente.

---

## 3. Reglas del juego

- **Longitud del código:** 4 posiciones (`codeLength = 4`).
- **Intentos máximos:** 7 filas (`maxAttempts = 7`), configurable.
- **Paleta de colores:** conjunto de colores disponibles en el nivel. Por defecto 6; la dificultad puede ampliarla (ver sección 5).
- **Repeticiones de color en el código:** permitidas y configurables (`allowRepeats`). Por defecto: **fácil sin repeticiones**, **avanzado con repeticiones**.
- **Victoria:** el intento coincide exactamente con el código secreto (4 verdes) antes de agotar los intentos.
- **Derrota:** se agotan los intentos sin acertar. Al fallar, se **repite el mismo nivel** (comportamiento indulgente del aparato físico: no se retrocede).
- **Avance de nivel:** al ganar, `level` incrementa y se genera un código nuevo. En 1 jugador el nivel puede modular la dificultad (paleta y repeticiones).

### 3.1 Configuración (valores por defecto + ajustables)

Los parámetros del juego tienen un valor por defecto **pero deben ser configurables en tiempo de ejecución**, no constantes fijas. Se centralizan en un objeto `config` (en `game/constants.js`) y se exponen en una **pantalla de Ajustes** accesible desde el menú.

| Parámetro        | Por defecto | Rango sugerido | Notas |
|------------------|-------------|----------------|-------|
| `colorCount`     | 6           | 4–8            | Nº de colores disponibles; toma los primeros N de la paleta maestra. |
| `maxAttempts`    | 7           | 4–12           | Nº de filas/intentos. |
| `codeLength`     | 4           | 3–6            | Nº de posiciones del código. Dejar preparado aunque en v1 se use 4. |
| `allowRepeats`   | según modo  | bool           | Fácil: no · Avanzado: sí (ambos sobreescribibles en Ajustes). |

Reglas de implementación:
- La paleta maestra tiene al menos 8 colores definidos (sección 11); `palette` = los primeros `colorCount`.
- Validar: `colorCount ≥ 1`; si `allowRepeats` es `false`, exigir `colorCount ≥ codeLength` (si no, forzar repeticiones o avisar).
- Al cambiar la config se aplica **a la siguiente partida/nivel**, no a la fila en curso.
- La config se persiste (`localStorage`, sección 13) junto con `mode` y `muted`.
- En dúo, la config (colores/intentos/modo) se fija **antes** de que el J1 defina el código.

---

## 4. Semántica de las pistas

Tras comprobar un intento, cada casilla puede tener una de tres marcas:

| Marca      | Significado                                             |
|------------|--------------------------------------------------------|
| 🟢 Verde   | Color correcto **en la posición correcta**             |
| ⚪ Blanco  | Color presente en el código pero **en otra posición**  |
| (sin luz)  | Color **no está** en el código                          |

La **diferencia entre modos es solo de presentación**:

- **Fácil:** las marcas se muestran **debajo de cada casilla**, por posición → el jugador sabe exactamente qué casilla acertó. Usa `feedback.perPosition`.
- **Avanzado:** las marcas se **agrupan al lado** como conteos (X verdes, Y blancas), sin indicar a qué casilla corresponden → Mastermind clásico. Usa `feedback.greens` y `feedback.whites`.

Una única función evalúa el intento y devuelve ambas representaciones; la UI decide cuál pintar según el modo. **La cuenta de verdes/blancas agregada debe coincidir siempre con el número de marcas verde/blanco por posición** (garantía de consistencia entre modos).

---

## 5. Dificultad

| Parámetro       | Fácil            | Avanzado          |
|-----------------|------------------|-------------------|
| Tamaño paleta   | 4–5 colores      | 6+ colores        |
| Repeticiones    | No               | Sí                |
| Presentación pistas | Por posición | Agrupadas al lado |
| Nº de niveles (ref. original) | 100 | 500 |

En 1 jugador, la dificultad puede escalar suavemente con `level` (más colores al avanzar). En 2 jugadores, el modo (fácil/avanzado) lo elige quien va a adivinar antes de empezar, o se fija en el menú.

---

## 6. Modos de juego y flujos

### 6.1 Un jugador
1. Menú → elegir **1 jugador** y modo (fácil/avanzado).
2. La app genera el código secreto según paleta/`allowRepeats` del nivel.
3. El jugador rellena filas e intenta romper el código en ≤ 7 intentos.
4. Victoria → overlay de éxito → siguiente nivel. Derrota → overlay → repetir nivel.

### 6.2 Dos jugadores (pasar y jugar)
1. Menú → elegir **2 jugadores** y modo.
2. **Fase `settingCode`:** el Jugador 1 define el código secreto usando el mismo selector de color, en una **entrada oculta** (las casillas no revelan el color al confirmar, o se enmascaran). Confirmar el código.
3. Pantalla de traspaso ("pasa el dispositivo al Jugador 2").
4. **Fase `playing`:** el Jugador 2 adivina con las reglas normales.
5. Al terminar: mostrar resultado y ofrecer **intercambiar roles** para la siguiente ronda.

La evaluación de intentos es **idéntica** en ambos modos; dúo solo añade la fase previa `settingCode` y registrar quién puso el código (`codeSetter`).

---

## 7. Modelo de entrada (paleta + mando + teclado)

Los tres inputs **no contienen lógica de juego**: solo despachan acciones al reducer. Son mandos intercambiables enchufados a la misma consola.

**Acciones de entrada compartidas:**

- `SET_ACTIVE_PEG(pos)` — seleccionar la casilla a editar en la fila activa.
- `CYCLE_COLOR(dir)` — cambiar el color de la casilla activa al siguiente/anterior (`dir = +1 | -1`).
- `SET_COLOR(pos, color)` — asignar un color concreto a una casilla.
- `SUBMIT_GUESS` — comprobar la fila activa (solo si está completa).

**Adaptadores:**

- **Paleta (web-nativa, MVP):** clic en casilla → `SET_ACTIVE_PEG`; clic en color de la paleta → `SET_COLOR`; botón "Comprobar" → `SUBMIT_GUESS`.
- **Mando giratorio (pulido):** arrastrar/rueda para girar → `CYCLE_COLOR`; clic corto → avanzar de casilla (`SET_ACTIVE_PEG` a la siguiente); mantener pulsado → `SUBMIT_GUESS`. Reproduce el gesto físico.
- **Teclado (accesibilidad, gratis):** ←/→ mover casilla; ↑/↓ cambiar color; Enter → comprobar. Documentar los atajos en pantalla.

**Presentación recomendada:** mando y paleta **activos a la vez** (el mando como pieza retro central, la paleta como atajo rápido), más un ajuste "ocultar mando" para quien solo quiera clicar. Como comparten estado, siempre están sincronizados.

---

## 8. Modelo de datos y estado

Formas de datos (TypeScript; en JS respetar los mismos campos):

```ts
type Color = string;                 // id estable del color, p.ej. "red"
type Mark = 'green' | 'white' | 'none';
type Phase = 'menu' | 'settingCode' | 'handoff' | 'playing' | 'won' | 'lost';
type Mode = 'easy' | 'advanced';
type Players = 1 | 2;

interface Feedback {
  greens: number;                    // verdes agregados (modo avanzado)
  whites: number;                    // blancas agregadas (modo avanzado)
  perPosition: Mark[];               // marca por casilla (modo fácil); longitud = codeLength
}

interface Guess {
  pegs: (Color | null)[];            // longitud codeLength; null = casilla vacía
  feedback: Feedback | null;         // null hasta comprobar
}

interface GameState {
  phase: Phase;
  mode: Mode;
  players: Players;
  palette: Color[];                  // colores disponibles este nivel
  codeLength: number;                // 4
  maxAttempts: number;               // 7
  allowRepeats: boolean;
  secret: Color[];                   // el código a adivinar
  guesses: Guess[];                  // historial + fila activa
  activeRow: number;                 // índice de la fila activa
  activePeg: number;                 // índice de casilla activa dentro de la fila
  level: number;
  muted: boolean;
  codeSetter?: 1 | 2;                // en dúo, quién definió el código
}
```

**Acciones del reducer** (además de las de entrada de la sección 7):

- `NEW_GAME({ players, mode })`
- `START_SETTING_CODE` / `CONFIRM_CODE(code)` (dúo)
- `CONFIRM_HANDOFF`
- `NEXT_LEVEL`
- `RESET_LEVEL`
- `TOGGLE_MUTE`
- `HYDRATE(persistedState)` — restaurar desde `localStorage`

**Transiciones de fase:**

```
menu ──NEW_GAME(1p)──▶ playing
menu ──NEW_GAME(2p)──▶ settingCode ──CONFIRM_CODE──▶ handoff ──CONFIRM_HANDOFF──▶ playing
playing ──(4 verdes)──▶ won ──NEXT_LEVEL──▶ playing | settingCode
playing ──(sin intentos)──▶ lost ──RESET_LEVEL──▶ playing
cualquiera ──NEW_GAME──▶ (según players)
```

---

## 9. Lógica del juego (módulos puros)

Aislar en `src/game/engine.js` (sin React, testeable):

```ts
generateCode(palette: Color[], length: number, allowRepeats: boolean): Color[]
evaluateGuess(guess: Color[], code: Color[]): Feedback
isSolved(feedback: Feedback, codeLength: number): boolean   // greens === codeLength
```

### 9.1 Algoritmo de `evaluateGuess` (CRÍTICO — manejar repetidos bien)

**Verdes (agregado):**
```
greens = número de posiciones i donde guess[i] === code[i]
```

**Blancas (agregado, correcto con repeticiones):**
```
para cada color c:
  matches += min( veces que c aparece en guess , veces que c aparece en code )
whites = matches - greens
```

**Marcas por posición (modo fácil), determinista en dos pasadas:**
```
perPosition = ['none', ...]           // longitud codeLength
codeUsed    = [false, ...]            // qué posiciones del code ya se han "consumido"

// Pasada 1 — verdes
para i en 0..n-1:
  si guess[i] === code[i]:
    perPosition[i] = 'green'
    codeUsed[i] = true

// Pasada 2 — blancas, de izquierda a derecha
para i en 0..n-1 donde perPosition[i] !== 'green':
  buscar la primera posición j con codeUsed[j] === false y code[j] === guess[i]
  si existe:
    perPosition[i] = 'white'
    codeUsed[j] = true
  // si no existe → queda 'none'
```

**Invariante que deben cumplir los tests:** el número de `'green'` en `perPosition` es igual a `greens`, y el número de `'white'` es igual a `whites`. Así los dos modos son coherentes.

Casilla vacía (`null`) → no puede comprobarse: `SUBMIT_GUESS` se ignora si la fila no está completa.

---

## 10. Arquitectura de componentes

```
<App>                       // provee estado (reducer) + hooks globales
 └─ <SuperDecoder>          // orquesta fases; decide qué pantalla mostrar
    ├─ <Menu>               // elegir 1/2 jugadores y modo
    ├─ <SettingsScreen>     // ajustes: colorCount, maxAttempts, codeLength, allowRepeats
    ├─ <SetCodeScreen>      // dúo: J1 define el código (entrada oculta)
    ├─ <HandoffScreen>      // dúo: "pasa el dispositivo"
    ├─ <DeviceShell>        // chasis retro-moderno (marco visual, glow)
    │   ├─ <LevelDisplay>   // número de nivel / intentos restantes (display segmentado)
    │   ├─ <Board>          // lista de filas
    │   │   └─ <GuessRow>   // fila activa o histórica
    │   │       ├─ <PegSlot>   // casilla de color (con estado activo/vacío)
    │   │       └─ <Feedback>  // pistas: por-posición (fácil) o agrupadas (avanzado)
    │   ├─ <ColorPalette>   // selector de colores (input)
    │   ├─ <Knob>           // mando giratorio (input; opcional/ocultable)
    │   ├─ <ModeSlider>     // fácil / avanzado (si se permite cambiar en caliente)
    │   └─ <Controls>       // comprobar, reiniciar, silencio, ocultar mando
    └─ <ResultOverlay>      // éxito / derrota + acción siguiente
```

**Responsabilidades clave:**
- `SuperDecoder` es un *switch* sobre `phase`; no contiene reglas.
- `Board`/`GuessRow`/`PegSlot` son de presentación pura, derivan todo del estado.
- `Feedback` recibe el modo y el `feedback` y decide su render.
- `ColorPalette`, `Knob` y el hook de teclado solo despachan acciones (sección 7).

---

## 11. Diseño visual (moderno inspirado)

Homenaje, no réplica. Guiños reconocibles con acabado actual: LEDs con glow, mando naranja, display de nivel, pistas verde/blanco.

**Tokens sugeridos (ajustables):**
```
--bg:           #0E1420   /* fondo consola, oscuro */
--panel:        #131A26
--panel-edge:   #1F2A3A
--accent:       #FF7A1A   /* naranja del mando */
--text:         #E8EDF5
--muted:        #8A97A8

/* LEDs de color del código (6 base) */
--c-red:     #FF4D5E
--c-orange:  #FF9F1C
--c-yellow:  #FFD23F
--c-green:   #3DDC84
--c-cyan:    #21D4FD
--c-blue:    #5B6BFF
/* extras para dificultad alta */
--c-magenta: #B15CFF
--c-white:   #F5F5F5

/* pistas */
--hint-green: #3DDC84
--hint-white: #F2F4F8
```

**Detalles de estilo:**
- Casillas LED con brillo/`box-shadow` de color y transición suave al cambiar (150–200 ms).
- Fila activa resaltada; filas históricas atenuadas.
- Display de nivel con tipografía monoespaciada/segmentada (p.ej. *Share Tech Mono*, *Chakra Petch* u *Orbitron*); cuerpo con fuente limpia (*Inter* / system-ui).
- Mando naranja con rotación real al cambiar color (transform rotate) y feedback táctil visual.
- Animaciones de victoria (destello de LEDs) y derrota (parpadeo tenue), coherentes con los sonidos.

### 11.1 Responsive (móvil primero)

- **Diseño móvil primero**, adaptable a escritorio. El chasis (`DeviceShell`) escala con el viewport; usar unidades relativas y `clamp()` para tamaños de casilla, fuentes y espaciados.
- Layout que se reorganiza por breakpoints: en pantallas estrechas el tablero ocupa el ancho, la paleta pasa a la parte inferior (cómoda para el pulgar) y el mando se **reduce u oculta** (ajuste "ocultar mando").
- Evitar scroll horizontal; que la partida completa quepa en pantalla sin zoom siempre que sea posible.
- Considerar el `viewport` con `viewport-fit=cover` y `env(safe-area-inset-*)` para móviles con notch.
- Bloquear el zoom por doble toque en los controles interactivos con `touch-action: manipulation`.

### 11.2 Controles táctiles

- **Objetivos de toque ≥ 44×44 px** (casillas, colores de la paleta, botones). Espaciado suficiente para no acertar el color de al lado.
- **Paleta y casillas:** funcionan de forma nativa al tacto (son botones); usar `onPointerDown`/`onClick` y estados `:active`/`aria-pressed` visibles. Sin `:hover` como única señal.
- **Mando giratorio al tacto (el punto delicado):**
  - Implementar con **Pointer Events** (`onPointerDown/Move/Up` + `setPointerCapture`) para unificar ratón, táctil y lápiz en un solo código.
  - Aplicar `touch-action: none` sobre el mando para que arrastrar para girar **no** dispare el scroll de la página.
  - Calcular el giro por el ángulo del puntero respecto al centro del mando; convertir el delta angular en pasos de `CYCLE_COLOR`. Umbral/`snap` por paso para que no cambie de color de forma nerviosa.
  - Alternativa/refuerzo en móvil: **tap corto sobre el mando = siguiente color**, y flechas ± visibles junto al mando, para no obligar a nadie a "girar" con precisión en una pantalla pequeña.
  - Gestos de acción: `SUBMIT_GUESS` mediante mantener pulsado el mando **o** un botón "Comprobar" siempre visible (recomendado en móvil por fiabilidad).
- **Prevenir gestos accidentales:** deshabilitar selección de texto (`user-select: none`) en controles y el menú contextual de pulsación larga donde estorbe.
- Probar en móvil real (iOS Safari y Android Chrome), no solo en el emulador del navegador: el comportamiento de `touch-action` y la captura de puntero varía.

**Accesibilidad:**
- No depender solo del color: cada color tiene una etiqueta/patrón o `aria-label`; las pistas verde/blanco llevan texto alternativo ("correcta", "presente", "ausente").
- Navegación por teclado completa (sección 7) y `focus` visible.
- Contraste AA en texto e íconos.

---

## 12. Sonido

- Efectos cortos tipo beep retro: seleccionar color, comprobar, victoria, derrota. Opcional: eco a "Morse" como guiño.
- Web Audio API o `<audio>`; precargar; respetar `muted` (persistido).
- Toggle de silencio siempre accesible en `Controls`.
- Aislar en `useSound()` para que el resto de la app no dependa de la implementación de audio.

---

## 13. Persistencia

- Guardar en `localStorage`: `level`, `mode`, `muted` (y opcionalmente el progreso de la partida en curso).
- Aislar en `usePersistence()` con `HYDRATE` al arrancar y guardado en cambios relevantes.
- Debe poder desactivarse con una bandera (para entornos sin `localStorage`).

---

## 14. Estructura de carpetas propuesta

```
src/
  main.jsx
  App.jsx
  game/
    engine.js         // generateCode, evaluateGuess, isSolved  (puro)
    reducer.js        // gameReducer, initialState, creadores de acciones
    constants.js      // paletas, config de dificultad, textos
  components/
    SuperDecoder.jsx
    Menu.jsx
    SetCodeScreen.jsx
    HandoffScreen.jsx
    DeviceShell.jsx
    Board.jsx
    GuessRow.jsx
    PegSlot.jsx
    Feedback.jsx
    ColorPalette.jsx
    Knob.jsx
    LevelDisplay.jsx
    ModeSlider.jsx
    Controls.jsx
    ResultOverlay.jsx
  hooks/
    useSound.js
    usePersistence.js
    useKeyboardControls.js
  styles/
    tokens.css
  assets/
    sounds/
tests/
  engine.test.js
```

---

## 15. Roadmap por fases

**Fase 1 — MVP (núcleo jugable):**
- `engine.js` completo + tests de `evaluateGuess` (con repetidos).
- Reducer y máquina de estados (`menu → playing → won/lost`).
- Tablero, `PegSlot`, paleta táctil, `Controls`, `Feedback` en ambos modos.
- **1 y 2 jugadores** (incluida fase `settingCode`/`handoff`).
- Overlay de resultado, avance/reinicio de nivel.
- **Pantalla de Ajustes** con `colorCount` y `maxAttempts` configurables (sección 3.1).
- Estilos base con los tokens y **layout responsive** funcional (paleta táctil cómoda en móvil).

**Fase 2 — Pulido:**
- `Knob` (mando giratorio) + control por teclado.
- Sonido (`useSound`) y persistencia (`usePersistence`).
- Animaciones de LED, glow, transiciones, responsive fino.
- Ajuste "ocultar mando".

**Fase 3 — Extras (opcional):**
- Escalado de dificultad por nivel en 1 jugador.
- Modo contrarreloj / estadísticas.
- Temas de color; más colores en niveles altos.

---

## 16. Criterios de aceptación

- `evaluateGuess` correcto para casos con y sin repetidos; verdes/blancas agregadas coinciden con las marcas por posición (invariante de la sección 9.1).
- No se puede comprobar una fila incompleta.
- Al acertar los 4 → estado `won`; al agotar intentos → `lost` y repetir el mismo nivel.
- Modo fácil muestra pistas por casilla; avanzado muestra solo conteos agregados.
- Dúo: el código del J1 no se revela al J2 durante `settingCode`/`handoff`.
- Paleta, mando y teclado producen exactamente el mismo comportamiento (comparten acciones).
- Jugable con teclado y con lector de pantalla razonable.
- **Configurable:** cambiar `colorCount` y `maxAttempts` en Ajustes afecta a la siguiente partida y se persiste; validación de `allowRepeats` vs `colorCount`/`codeLength` respetada.
- **Responsive:** jugable sin scroll horizontal ni zoom en móvil (viewport estrecho) y en escritorio.
- **Táctil:** objetivos de toque ≥ 44 px; la paleta responde bien al tacto; el mando gira con el dedo sin desplazar la página (`touch-action`) y ofrece alternativa por tap/flechas.

---

## 17. Cómo arrancar la sesión de Claude Code

Sugerencia de primer prompt para la sesión:

> "Implementa la Fase 1 (MVP) del documento `super-decoder-especificaciones.md`: crea el proyecto con Vite + React, implementa `game/engine.js` con sus tests, el reducer y la máquina de estados, y los componentes de tablero, paleta, pistas (modos fácil/avanzado) y overlays, con soporte de 1 y 2 jugadores. Usa los tokens de estilo de la sección 11. No añadas el mando ni el sonido todavía."

Después, en iteraciones siguientes, pedir la Fase 2 (mando, teclado, sonido, persistencia, animaciones) y la Fase 3.

**Orden recomendado de implementación:** engine + tests → reducer → pantallas/menú → tablero e inputs → pistas por modo → dúo → estilos → pulido.

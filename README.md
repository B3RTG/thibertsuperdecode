# ThiBert Arcade

Colección de minijuegos retro en React + Vite (sin backend). Desde un **hub**
inicial se elige el juego. El primero es **Superdecoder** (romper códigos, estilo
*GiiKER Super Decoder*); su especificación está en
[`doc/super-decoder-especificaciones.md`](doc/super-decoder-especificaciones.md).

## Arquitectura de hub

- **Shell** ([src/App.jsx](src/App.jsx)) — preferencias globales + router mínimo (`hub | settings | game`).
- **Preferencias globales** ([src/app/PreferencesContext.jsx](src/app/PreferencesContext.jsx)) — `theme`, `lang`, `sound`, persistidas en `thibert:prefs` y compartidas por todos los juegos.
- **Registro de juegos** ([src/games/registry.js](src/games/registry.js)) — añadir un juego = una entrada; cada juego se carga con *code-splitting* (lazy).
- **Cada juego** vive en `src/games/<id>/` con su propio reducer, estado y persistencia namespaced (`thibert:game:<id>`, incluye sus estadísticas).
- **Migración** automática desde la clave antigua (`super-decoder:v1`) a la nueva estructura, sin perder progreso/preferencias.
- **Ajustes** partidos: *Generales* (tema/idioma/sonido, desde el hub) y *del juego* (reglas, dentro de cada juego).

## Superdecoder (Fases 1–3 del documento)

## Fase 1 (MVP)

- **`src/games/superdecoder/engine.js`** — lógica pura (`generateCode`, `evaluateGuess`, `isSolved`) con manejo correcto de colores repetidos, más tests (`tests/`).
- **`src/games/superdecoder/reducer.js`** — máquina de estados (`menu → playing → won/lost`, y `settingCode → handoff → playing` en dúo).
- **Componentes** — tablero, casillas LED, paleta táctil, pistas en modo **fácil** (por posición) y **avanzado** (conteos agregados), overlays de resultado.
- **1 y 2 jugadores** (pasar y jugar, con código oculto e intercambio de roles).
- **Pantalla de Ajustes** — `colorCount`, `maxAttempts`, `codeLength`, `allowRepeats` (persistidos en `localStorage`).
- Estilos con los **tokens de la sección 11** y layout **responsive** (móvil primero).

## Fase 2 (Pulido)

- **`Knob`** — mando giratorio con Pointer Events (ratón/tacto/lápiz): girar/rueda/flechas ± = cambiar color, tap corto = avanzar de casilla, mantener pulsado = comprobar, `touch-action: none`. La rotación refleja el color activo. Con el mando solo se completa una fila entera.
- **Sonido** (`useSound`) — beeps retro con Web Audio API (seleccionar, comprobar, victoria, derrota); respeta `muted`, aislado tras contexto.
- **Entrada por teclado** (`useKeyboardControls`) — ←/→ casilla, ↑/↓ color, Enter comprobar.
- **Persistencia** (`usePersistence`) — `level`, `mode`, `muted`, `config`; desactivable sin `localStorage`.
- **Animaciones** — aparición de LED, glow de la fila activa, destello de victoria / parpadeo de derrota, con soporte de `prefers-reduced-motion`.
- Ajuste **"ocultar mando"** en los controles.

> Nota de diseño: `SET_COLOR` (paleta) avanza a la siguiente casilla; `CYCLE_COLOR` (mando/teclado) marca el color de la casilla activa **sin** avanzar, para poder pasar colores en la misma casilla.

## Fase 3 (Extras)

- **Escalado de dificultad por nivel** (1 jugador) — la paleta crece +1 color cada 3 niveles (hasta 8). Activable/desactivable en Ajustes (`scaleByLevel`).
- **Contrarreloj + estadísticas** — cronómetro por ronda en el `DeviceShell` (`Timer`), y pantalla de **Estadísticas** con partidas, ganadas/perdidas, % aciertos, racha, mejor racha, menos intentos y mejor tiempo (persistidas; solo 1 jugador). El overlay muestra el tiempo y avisa de "¡nuevo récord!".
- **Modo contrarreloj** — toggle `timedMode` con `timeLimitSec` configurable en Ajustes: el cronómetro cuenta hacia atrás, se resalta al bajar de 10s y, al llegar a 0, se pierde la ronda con overlay "¡Se acabó el tiempo!". La detección la hace el `Timer` (despacha `TIME_UP`) porque el reducer es puro.
- **Temas de color** — Clásico, Neón, Ámbar, Menta y **Claro**, seleccionables en Ajustes y aplicados vía `data-theme` (los LEDs del código no cambian, por consistencia de juego). Persistido. Las superficies y líneas usan *tokens semánticos* (`--sunken`, `--hairline`, `--soft`, `--scrim`, `--panel-2`, `--bg-glow`) para que el tema claro adapte sin tocar cada componente.

## Idiomas (i18n)

- **Español e inglés**, seleccionables en Ajustes y persistidos. Diccionarios en [src/i18n/translations.js](src/i18n/translations.js); los componentes leen los textos con `useTexts()` a través de `LanguageContext`. Añadir un idioma es agregar una entrada a `TRANSLATIONS` y a `LANGUAGES`.

## Scripts

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests del engine y el reducer
npm run build    # build de producción
```

## Controles de teclado

- ←/→ mover casilla · ↑/↓ cambiar color · Enter comprobar.

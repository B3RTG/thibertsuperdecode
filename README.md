# ThiBert Superdecoder

Juego de romper códigos (estilo *GiiKER Super Decoder*) en React + Vite.
Implementa las **Fases 1, 2 y 3** de [`doc/super-decoder-especificaciones.md`](doc/super-decoder-especificaciones.md).

## Fase 1 (MVP)

- **`src/game/engine.js`** — lógica pura (`generateCode`, `evaluateGuess`, `isSolved`) con manejo correcto de colores repetidos, más tests (`tests/`).
- **`src/game/reducer.js`** — máquina de estados (`menu → playing → won/lost`, y `settingCode → handoff → playing` en dúo).
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
- **Temas de color** — Clásico, Neón, Ámbar y Menta, seleccionables en Ajustes y aplicados vía `data-theme` (los LEDs del código no cambian, por consistencia de juego). Persistido.

## Scripts

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests del engine y el reducer
npm run build    # build de producción
```

## Controles de teclado

- ←/→ mover casilla · ↑/↓ cambiar color · Enter comprobar.

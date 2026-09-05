# Roadmap — ThiBert Superdecoder

Estado actual: **Fases 1, 2 y 3 completas** (ver [README](README.md)). Este documento
recoge mejoras propuestas para próximas versiones. No hay ninguna comprometida;
son ideas priorizadas de mayor a menor valor / esfuerzo razonable.

## Próximas versiones (ideas)

### Jugabilidad
- [x] **Modo contrarreloj**: cuenta atrás configurable (`timedMode` + `timeLimitSec`) que provoca derrota al llegar a 0, con resaltado bajo 10s y overlay "¡Se acabó el tiempo!".
- [ ] **Dar pista / rendirse**: revelar una casilla a cambio de penalización, o abandonar la ronda.
- [ ] **Deshacer última casilla** antes de comprobar.
- [ ] **Semilla compartible**: reproducir un código concreto por código/seed para retar a otra persona.
- [ ] **Escalado de dificultad más rico**: activar repeticiones y/o alargar el código en niveles altos, no solo añadir colores.

### Accesibilidad e i18n
- [x] **Internacionalización (ES/EN)** — diccionarios en `src/i18n/`, selector en Ajustes, persistido; `useTexts()` en los componentes.
- [ ] Más idiomas (estructura ya lista: añadir una entrada a `TRANSLATIONS`).
- [ ] **Patrones/íconos por color** además del color (daltonismo) — hoy hay `aria-label`, falta señal visual no cromática.
- [ ] Revisión de contraste AA en todos los temas (el tema claro, si se añade, necesita repaso).

### Temas y visual
- [x] **Tema claro** — añadido como quinto tema. (Pendiente: respetar `prefers-color-scheme` automáticamente.)
- [ ] Detectar `prefers-color-scheme` para elegir claro/oscuro por defecto.
- [ ] Más temas y/o editor de tema.
- [ ] Pulido de animaciones (transición entre filas, entrada del overlay).

### Datos y persistencia
- [ ] **Historial de partidas** y gráfica de progreso.
- [ ] **Exportar/importar** estadísticas (JSON).
- [ ] Estadísticas separadas por modo (fácil/avanzado) y por longitud de código.

### Sonido
- [ ] Ajuste de **volumen** (hoy solo silencio on/off).
- [ ] Guiño "Morse" opcional al comprobar (mencionado en la spec §12).

### Técnico / calidad
- [ ] **Tests de componentes** (React Testing Library) además de los de `engine`/`reducer`.
- [ ] **PWA**: instalable y jugable offline (manifest + service worker).
- [ ] CI en GitHub Actions: `npm test` + `npm run build` en cada push/PR.
- [ ] Migrar la lógica a **TypeScript** (la spec lo recomienda; hoy es JS con las formas de datos de la §8).

### Multijugador
- [ ] Online / por turnos remoto (fuera del alcance v1, requeriría backend).

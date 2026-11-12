# Plan de implementación — Prototipo VoxRadar

## Objetivo

Prototipo navegable de media fidelidad (Ítem 9 de la evaluación) que permite completar
las tres tareas críticas del informe usando una **reunión de demostración simulada**.
No capta audio real: el sonido y la dirección de las voces se simulan con un guion.

## Usuario y contexto

Proto-persona "Participante comunitario con audífono": persona mayor con hipoacusia que
participa en una junta presencial de ~20 personas (P1, hallazgos H1–H9).

## Tareas críticas

| Tarea | Descripción | Necesidad |
| --- | --- | --- |
| T1 | Identificar quién habla y desde qué dirección | N1, N5 |
| T2 | Recuperar lo dicho en los últimos minutos | N2, N3 |
| T3 | Saber cuándo hay un turno libre para intervenir | N4 |

## Pantallas

| # | Pantalla | Ruta | Tarea | Decisión |
| --- | --- | --- | --- | --- |
| 1 | Inicio | `#/inicio` | T1 | D6 |
| 2 | Radar principal | `#/radar` | T1, T2, T3 | D1, D2, D3, D4 |
| 3 | Asignar nombre | `#/nombre/:id` | T1 | D1 |
| 4 | ¿Qué me perdí? | `#/perdi` | T2 | D3 |
| 5 | Detalle de intervención | `#/detalle/:id` | T2 | D5 |
| 6 | Turno libre (aviso) | capa sobre el radar | T3 | D4 |
| 7 | Ajustes | `#/ajustes` | — | D5, D6 |

## Decisiones técnicas

- **PWA sin paso de compilación** (HTML + CSS + módulos ES): se publica tal cual en
  GitHub Pages, se abre con un enlace y se puede instalar en el celular.
- **Lógica pura separada de la interfaz** (`src/core`): funciones sin efectos
  secundarios e inmutables, probadas con `node:test`.
- **Interfaz sin `innerHTML`**: todo el DOM se crea con `createElement` y
  `textContent` para evitar XSS.
- **Accesibilidad**: tipografía Atkinson Hyperlegible, texto base de 18 px escalable
  hasta 200 %, objetivos táctiles de 48 px o más, contraste ≥ 4,5:1, estados que
  nunca dependen solo del color, regiones `aria-live` para cambios de hablante.
- **Parámetros de demostración** (`?velocidad=`, `?t=`, `?congelar=1`) para pruebas
  deterministas y para capturas del informe.

## Fases

1. Núcleo con TDD: simulación, historial, nombres, ajustes, geometría, parámetros.
2. Interfaz de las 7 pantallas y PWA (manifest, service worker, íconos).
3. Pruebas E2E de T1–T3, ancho mínimo de 320 px y capturas.
4. Revisión, README, publicación en GitHub Pages.

## Riesgos

- Sin acceso a red durante el desarrollo: no se usan dependencias externas en
  tiempo de ejecución; la fuente se carga desde Google Fonts con alternativa local.
- La vibración no existe en iOS Safari: el aviso de turno libre también es visual.

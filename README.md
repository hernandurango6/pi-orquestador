# pi-orquestador

Paquete de orquestación de agentes para [Pi](https://pi.dev) y [PiG](https://github.com/MichaelKinsy/PiG) con ejecución durable basada en los roles especializados **Explore**, **Worker** y **Verifier**.

Inspirado en la división de responsabilidades de MiniMax Code (Mavis / Agent Team).

## Características

- **3 roles especializados 1:1**:
  - `explore`: Localizador de código y mapeador de evidencia en modo solo lectura (`read`, `grep`, `find`, `ls`, `bash` de solo lectura). No modifica archivos.
  - `worker`: Productor acotado con herramientas completas de edición (`read`, `edit`, `write`, `bash`, etc.) para implementar cambios bajo alcance y criterios de aceptación específicos.
  - `verifier`: Auditor independiente y escéptico. Corre pruebas y revisiones de código emitiendo veredictos estructurados (`PASS | FAIL | PARTIAL`). No modifica código fuente.
- **Reglas del orquestador automáticas**: Guía al modelo principal para no saturar el contexto, aplicar la compuerta de 2-3 búsquedas previas antes de delegar y seleccionar al agente según el tipo de entregable.
- **Ejecución durable**: Construido sobre `pi-agents` y `pi-durable`. Las tareas corren en segundo plano, guardan puntos de control atómicos y sobreviven a reinicios o caídas.
- **Soporte dual**: Funciona idénticamente en **Pi** (Node/TypeScript) y en **PiG** (Go nativo).

## Instalación

En **Pi**:

```bash
pi install git:github.com/hernandurango6/pi-orquestador
```

En **PiG**:

```bash
pig install git:github.com/hernandurango6/pi-orquestador
```

La instalación instala automáticamente la dependencia `pi-agents` y sincroniza los perfiles de agentes en tu entorno de usuario (`~/.pi/agent/agents` o `~/.pig/agent/agents`).

## Uso

En cualquier conversación interactiva con Pi o PiG, pedí delegación en lenguaje natural:

### 1. Delegar investigación
> "Delega en el agente explore la revisión de la estructura de rutas y dependencias."

### 2. Delegar implementación acotada
> "Pide a un agente worker que implemente la función de validación según estas especificaciones."

### 3. Pipeline secuencial completo (Grafo)
> "Inicia un grafo con explore, worker y verifier en secuencia para resolver este problema."

Durante la ejecución podrás ver el panel de agentes (`/agents`), conectar con ellos en vivo y revisar sus resultados finales.

## Licencia

MIT

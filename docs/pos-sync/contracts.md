# Contratos compartidos

Los esquemas Zod de la API POS viven en:

```
src/modules/pos-sync/contracts/
├── common.ts            # errores, versión, resúmenes de branch/device
├── pair.ts              # vinculación
├── pull.ts              # pull híbrido (snapshot / incremental)
├── push.ts              # push idempotente
├── modules/
│   ├── pos-user.ts      # payload de usuario POS
│   └── warehouse.ts     # payload de almacén
└── index.ts             # re-exporta todo
```

## Regla de oro

Esta carpeta **solo depende de `zod`**. No importa nada con el alias `#/` ni
nada del resto del proyecto. Así puedes copiarla tal cual al proyecto de
Electron y ambos lados comparten exactamente los mismos tipos.

## Cómo copiarla al proyecto de Electron

1. Copia la carpeta completa `contracts/` a tu proyecto POS, por ejemplo a
   `src/sync/contracts/`.
2. Asegúrate de tener `zod` instalado en el POS (misma versión mayor: `zod@^4`).
3. Importa y valida en el POS:

   ```ts
   import {
     pairRequestSchema,
     pairResponseSchema,
     pullResponseSchema,
     pushRequestSchema,
     pushResponseSchema,
     posApiErrorSchema,
     POS_API_VERSION,
   } from "./sync/contracts";

   const parsed = pullResponseSchema.parse(await res.json());
   ```

## Cómo mantenerlos sincronizados

- La app web es la **fuente** del contrato. Cuando cambie aquí, vuelve a copiar
  la carpeta al POS.
- Versiona la API por ruta (`/api/pos/v1`). Si haces un cambio incompatible,
  crea `v2` en lugar de romper `v1`, para que POS viejos sigan funcionando hasta
  que actualicen.
- `POS_API_VERSION` exporta la versión actual (`"v1"`) para construir URLs en el
  POS sin hardcodearla.

## Contenido rápido

| Esquema                | Uso                                             |
| ---------------------- | ----------------------------------------------- |
| `pairRequestSchema`    | cuerpo de `POST /pair`                           |
| `pairResponseSchema`   | respuesta de `POST /pair`                        |
| `pullRequestSchema`    | cuerpo de `POST /sync/pull`                      |
| `pullResponseSchema`   | respuesta de `POST /sync/pull`                   |
| `pushRequestSchema`    | cuerpo de `POST /sync/push`                      |
| `pushResponseSchema`   | respuesta de `POST /sync/push`                   |
| `posApiErrorSchema`    | cualquier respuesta de error                     |
| `snapshotModule(T)`    | helper para declarar un módulo tipo snapshot     |
| `incrementalModule(T)` | helper para declarar un módulo tipo incremental  |

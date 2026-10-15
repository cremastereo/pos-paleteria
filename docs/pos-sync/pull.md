# Pull: recibir datos (web → POS)

El `pull` lo dispara el POS (botón manual). El servidor responde con un conjunto
de **módulos**. Cada módulo decide su modo de entrega.

## Petición

```http
POST /api/pos/v1/sync/pull
Authorization: Bearer pos_xxxxxxxx...
Content-Type: application/json

{
  "cursors": { "warehouse": "2026-10-14T20:00:00.000Z" },
  "device": { "platform": "win32", "hostname": "PC-CAJA-1", "appVersion": "1.0.0" }
}
```

- `cursors` es opcional: por módulo, el POS reenvía el cursor que recibió la vez
  anterior. Si no lo manda, el servidor responde el estado actual completo.
- `device` es opcional: refresca los metadatos del dispositivo.

Ambos campos pueden omitirse; un cuerpo vacío `{}` es válido.

## Respuesta (`pullResponseSchema`)

```json
{
  "serverTime": "2026-10-14T20:05:00.000Z",
  "device": { "id": "uuid", "name": "CAJA 1", "status": "active" },
  "branch": { "id": "uuid", "name": "SUCURSAL CENTRO", "address": "...", "active": true },
  "modules": {
    "warehouse": {
      "mode": "snapshot",
      "cursor": "2026-10-14T19:59:00.000Z",
      "data": [
        {
          "id": "uuid",
          "name": "ALMACÉN PRINCIPAL",
          "description": null,
          "active": true,
          "createdAt": "2026-10-01T10:00:00.000Z",
          "updatedAt": "2026-10-14T19:59:00.000Z"
        }
      ]
    },
    "posUsers": {
      "mode": "snapshot",
      "cursor": "2026-10-14T19:59:00.000Z",
      "data": [
        {
          "id": "uuid",
          "name": "CAJERO UNO",
          "username": "cajero.uno",
          "passwordHash": "$2b$10$...",
          "active": true,
          "branchIds": ["uuid-sucursal"],
          "createdAt": "2026-10-01T10:00:00.000Z",
          "updatedAt": "2026-10-14T19:59:00.000Z"
        }
      ]
    }
  }
}
```

## Modos de entrega (pull híbrido)

El contrato soporta dos modos por módulo. Hoy `warehouse` y `posUsers` usan
`snapshot`.

`posUsers` incluye solo los cajeros asignados a la sucursal del dispositivo,
activos e inactivos. `passwordHash` es un hash bcrypt para verificar la
contraseña sin conexión. El texto plano no viaja. No hay PIN.

### `snapshot`

```ts
{ mode: "snapshot", cursor: string | null, data: T[] }
```

- El servidor envía el **estado completo** del módulo.
- El POS **reemplaza** su copia local con `data`.
- Ventaja: simple, nunca deja datos viejos ni duplicados.
- Ideal para catálogos pequeños (almacenes, sucursales, productos...).

### `incremental`

```ts
{ mode: "incremental", cursor: string | null, upserts: T[], deletes: string[] }
```

- El servidor envía **solo lo que cambió** desde `cursors[módulo]`.
- El POS aplica `upserts` (insertar/actualizar) y borra los ids de `deletes`.
- Requiere que la entidad tenga `updatedAt` y borrado lógico en la web.
- Ideal para tablas grandes.

En ambos casos, **guarda `cursor`** y reenvíalo en el siguiente pull.

## Aplicar los datos en SQLite (ejemplo snapshot)

```ts
import { z } from "zod";
import { pullResponseSchema } from "./contracts"; // copia portada

const res = pullResponseSchema.parse(await response.json());

const wh = res.modules.warehouse;
if (wh.mode === "snapshot") {
  db.transaction(() => {
    db.prepare("DELETE FROM warehouse").run();
    const insert = db.prepare(
      "INSERT INTO warehouse (id, name, description, active) VALUES (?, ?, ?, ?)",
    );
    for (const w of wh.data) insert.run(w.id, w.name, w.description, w.active ? 1 : 0);
  })();
}

localStorage.setItem("pull.cursor.warehouse", wh.cursor ?? "");
```

> Haz los `fetch` desde el **proceso main** de Electron (no el renderer): así
> evitas CORS y mantienes el token fuera del contexto web.

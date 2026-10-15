# Push: enviar datos (POS → web)

El `push` lo dispara el POS periódicamente (cada ~5 min). Envía los registros
generados offline (ventas, movimientos de inventario, etc.). Hoy la base está
lista pero **no hay entidades registradas todavía**: un push con `items: []` es
válido y responde correctamente.

## Patrón outbox (clave para no duplicar)

En el POS, mantén una tabla local `outbox`:

| columna     | descripción                                             |
| ----------- | ------------------------------------------------------- |
| `clientId`  | UUID (idealmente **v7**) del registro. Clave de dedupe. |
| `entity`    | nombre de la entidad (ej. `sale`).                      |
| `operation` | `create` / `update` / `delete`.                         |
| `occurredAt`| ISO-8601 de cuándo ocurrió en el POS.                   |
| `payload`   | JSON del registro.                                      |
| `syncedAt`  | null hasta que la web lo confirme (`accepted`/`duplicate`). |

El servidor deduplica por `(device, entity, clientId)`. Por eso **el mismo
registro siempre debe llevar el mismo `clientId`**, aunque se reintente.

## Petición

```http
POST /api/pos/v1/sync/push
Authorization: Bearer pos_xxxxxxxx...
Content-Type: application/json

{
  "batchId": "0190f...-uuid",
  "sentAt": "2026-10-14T20:10:00.000Z",
  "items": [
    {
      "clientId": "0190f...-uuid",
      "entity": "sale",
      "operation": "create",
      "occurredAt": "2026-10-14T20:08:00.000Z",
      "payload": { "total": 1500, "lines": [] }
    }
  ]
}
```

- `batchId`: UUID del envío. **Reúsalo en los reintentos** del mismo lote.
- `items`: máximo 500 por lote.

## Respuesta (`pushResponseSchema`)

```json
{
  "batchId": "0190f...-uuid",
  "duplicateBatch": false,
  "accepted": 1,
  "duplicates": 0,
  "rejected": 0,
  "results": [
    { "clientId": "0190f...-uuid", "status": "accepted" }
  ]
}
```

Resultado por item (`status`):

- `accepted`: aplicado por primera vez. Marca `syncedAt` en el outbox.
- `duplicate`: ya se había recibido antes. Marca `syncedAt` igual (éxito).
- `rejected`: no se aplicó. Incluye `errorCode` y `message`.
  - `UNKNOWN_ENTITY`: la web aún no tiene handler para esa entidad.
  - `VALIDATION_ERROR`: el `payload` no cumple el esquema del handler.
  - `INTERNAL`: error del servidor; reintenta el item más tarde.

Si `duplicateBatch` es `true`, ese `batchId` ya se había procesado y el servidor
devuelve el mismo resultado sin reprocesar: seguro ante reintentos.

## Idempotencia garantizada

El servidor registra:

- cada lote en `sync_push_batch` por `(device, batchId)` — un reenvío del mismo
  lote devuelve la respuesta guardada;
- cada item aceptado en `sync_push_item` por `(device, entity, clientId)` — un
  reenvío del mismo registro responde `duplicate`.

Los items `rejected` **no** se guardan en el ledger, así puedes corregir el
`payload` y reenviar con el **mismo** `clientId`.

## Bucle de envío recomendado (cada 5 min, con backoff)

```ts
async function flushOutbox() {
  const pending = outbox.selectUnsynced(500);
  if (pending.length === 0) return;

  const batchId = crypto.randomUUID();
  const body = {
    batchId,
    sentAt: new Date().toISOString(),
    items: pending.map((r) => ({
      clientId: r.clientId,
      entity: r.entity,
      operation: r.operation,
      occurredAt: r.occurredAt,
      payload: JSON.parse(r.payload),
    })),
  };

  const res = await postJson("/api/pos/v1/sync/push", body); // guarda batchId por si hay reintento
  for (const item of res.results) {
    if (item.status !== "rejected") outbox.markSynced(item.clientId);
  }
}
```

- Si la red falla, **reintenta el mismo `batchId`** (no generes uno nuevo).
- Usa backoff exponencial ante `INTERNAL` o errores de red.
- Haz el `fetch` desde el **proceso main** de Electron (sin CORS).

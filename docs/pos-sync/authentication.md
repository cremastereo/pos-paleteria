# Autenticación de dispositivos POS

Cada POS se autentica con un **token propio por dispositivo**. No se usa el
sistema de usuarios de better-auth para esto: better-auth gestiona el acceso del
panel administrativo; los dispositivos POS usan este esquema aparte.

## Por qué token por dispositivo

- Si un POS se pierde o se reinstala, revocas o regeneras **solo ese**
  dispositivo, sin afectar a los demás de la sucursal.
- En el admin ves cada dispositivo, su estado y su última actividad.
- El token nunca se guarda en claro: en la base solo se guarda su hash SHA-256
  (`token_hash`) y un prefijo (`token_prefix`) para identificarlo en la UI.

## Flujo de vinculación (requiere internet la primera vez)

1. En el admin: `Configuración → Sucursales → (una sucursal) → Dispositivos POS
   → Nuevo dispositivo`. Se le da un nombre (ej. `CAJA 1`).
2. El admin genera un **código de vinculación** `XXXX-XXXX` que se muestra una
   sola vez y expira en 15 minutos.
3. En el POS (primera configuración), el usuario ingresa el código. El POS llama:

   ```http
   POST /api/pos/v1/pair
   Content-Type: application/json

   {
     "pairingCode": "ABCD-2345",
     "device": { "platform": "win32", "hostname": "PC-CAJA-1", "appVersion": "1.0.0" }
   }
   ```

4. Respuesta (`pairResponseSchema`):

   ```json
   {
     "deviceId": "uuid",
     "deviceToken": "pos_xxxxxxxx...",
     "branch": { "id": "uuid", "name": "SUCURSAL CENTRO", "address": "...", "active": true }
   }
   ```

5. El POS **guarda `deviceToken` de forma segura** y lo envía en cada petición
   posterior.

> El código se puede **regenerar** desde el admin (vuelve el dispositivo a
> `pending` e invalida el token anterior) para reinstalar un POS.

## Guardar el token en Electron

Usa `safeStorage` de Electron (cifrado por el sistema operativo):

```ts
import { safeStorage, app } from "electron";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const tokenPath = join(app.getPath("userData"), "device-token.bin");

export function saveDeviceToken(token: string) {
  writeFileSync(tokenPath, safeStorage.encryptString(token));
}

export function loadDeviceToken(): string | null {
  if (!existsSync(tokenPath)) return null;
  return safeStorage.decryptString(readFileSync(tokenPath));
}
```

## Uso del token

```http
GET /api/pos/v1/device
Authorization: Bearer pos_xxxxxxxx...
```

Respuesta: `{ serverTime, device: { id, name, status }, branch }`.
Úsalo como heartbeat para validar el token al arrancar el POS.

## Manejo de errores de autenticación

Todas las respuestas de error siguen `posApiErrorSchema`:
`{ "error": { "code": "...", "message": "..." } }`.

| code                   | HTTP | Qué hacer en el POS                                              |
| ---------------------- | ---- | --------------------------------------------------------------- |
| `UNAUTHORIZED`         | 401  | Token ausente o inválido. Pide re-vincular (nuevo código).      |
| `DEVICE_REVOKED`       | 403  | El dispositivo fue revocado. Borra el token local y re-vincula. |
| `BRANCH_INACTIVE`      | 403  | La sucursal está inactiva. Avisa y reintenta más tarde.         |
| `INVALID_PAIRING_CODE` | 400  | Código inválido o expirado. Pide uno nuevo.                     |
| `VALIDATION_ERROR`     | 422  | El cuerpo no cumple el contrato. Revisa el payload.             |
| `INTERNAL`             | 500  | Error del servidor. Reintenta con backoff.                      |

## Seguridad (resumen)

- Token de 32 bytes aleatorios, prefijado con `pos_`.
- Solo se almacena el hash SHA-256 en la base.
- El código de vinculación es de un solo uso y expira a los 15 min; también se
  guarda hasheado.
- Revocar o regenerar limpia el `token_hash`, invalidando el acceso al instante.

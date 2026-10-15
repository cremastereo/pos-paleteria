# API HTTP local

Base: `http://127.0.0.1:{puerto}`. El puerto lo elige Electron entre 5050 y 5060.

Salvo `GET /health`, cada request lleva:

```http
X-Tfhka-Token: <token de la sesión>
Content-Type: application/json
```

Un token ausente o distinto responde **401** con un envelope `Unauthorized`.

## Envelope

Las llamadas al SDK responden JSON con esta forma (`Contracts/Envelope.cs`):

```json
{
  "ok": true,
  "method": "SendCmd",
  "args": { "cmd": "3" },
  "startedAt": "2026-10-14T21:00:00-04:00",
  "durationMs": 40,
  "result": { "returnValue": true },
  "printerStatus": null,
  "sdkState": null,
  "warnings": [],
  "error": null
}
```

Si el SDK falla, `ok` es `false` y `error` trae `kind`, `type`, `message`, `statusError` y `stackTrace`. Si otra llamada ya ocupa la cola, el servicio responde ocupado (`BusyException`) en lugar de mezclar tramas en el COM.

En el renderer, `callSdk(baseUrl, token, endpoint, body)` hace `POST` con un timeout de 200 segundos. `getJson` sirve para las lecturas GET.

## Meta

| Método | Ruta | Cuerpo | Notas |
| --- | --- | --- | --- |
| GET | `/health` | — | Sin token. Devuelve `status`, `pid`, `sdkVersion`, `arch`, `port`, `busy` |
| GET | `/meta/sdk` | — | Reflexión de tipos y métodos de `TfhkaNet.IF` |
| GET | `/properties` | — | `ComPort`, `Estado`, `Status_Error`, `StatusPort`, timeouts y reintentos |
| POST | `/shutdown` | `{}` | Cierra el puerto y detiene el proceso |

## Conexión

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| GET | `/serialPorts` | — |
| POST | `/openFpctrl` | `{ "portName": "COM99" }` |
| POST | `/closeFpctrl` | `{}` |
| POST | `/checkFprinter` | `{}` |
| POST | `/checkDrawer` | `{}` |
| POST | `/getPrinterStatus` | `{}` |
| POST | `/readFpStatus` | `{}` |

## Comandos crudos

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| POST | `/sendCmd` | `{ "cmd": "3" }` |
| POST | `/sendFileCmd` | `{ "filePath": "C:\\ruta\\lote.txt" }` |
| POST | `/uploadReportCmd` | `{ "cmd": "U0X", "filePath": "C:\\ruta\\reporte.txt" }` |
| POST | `/uploadStatusCmd` | `{ "cmd": "S1", "filePath": "C:\\ruta\\status.txt" }` |

`cmd` es obligatorio en `/sendCmd`. `filePath` es obligatorio en el envío por archivo. Upload exige `cmd` y `filePath`.

## Reportes X

POST sin cuerpo (o `{}`): `/getXReport`, `/getX2Report`, `/getX4Report`, `/getX5Report`, `/getX6Report`, `/getX7Report`, `/printXReport`.

`/getX6Report` existe en HTTP, pero la DLL 1.7.6.2 no tiene el método. Ver [diferencias-dll.md](diferencias-dll.md).

## Reportes Z

| Ruta | Cuerpo |
| --- | --- |
| `/getZReport` | `{}` |
| `/getZ2Report` | `{}` |
| `/getZReportByDate` | `{ "startDate": "2026-10-14", "endDate": "2026-10-14" }` |
| `/getZReportByNumber` | `{ "startNumber": 1, "endNumber": 3 }` |
| `/printZReport` | `{ "confirm": true }` |
| `/printZReportByDate` | `{ "startDate": "...", "endDate": "..." }` |
| `/printZReportByNumber` | `{ "startNumber": 1, "endNumber": 3 }` |

`/printZReport` rechaza con **400** si `confirm` no es `true`. Ese cierre diario no debe dispararse por accidente.

## Estados S1–SV

POST `{}` a:

`/getS1PrinterData`, `/getS2PrinterData`, `/getS2EPrinterData`, `/getS21PrinterData`, `/getS22PrinterData`, `/getS23PrinterData`, `/getS25PrinterData`, `/getS3PrinterData`, `/getS4PrinterData`, `/getS5PrinterData`, `/getS6PrinterData`, `/getS7PrinterData`, `/getS8EPrinterData`, `/getS8PPrinterData`, `/getSVPrinterData`.

El significado de cada objeto está en el [manual, estados S](manual/04-estados-s.md).

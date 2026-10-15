# Ciclo de vida del servicio

## Publicar el ejecutable

`TfhkaNet.dll` exige un proceso de 32 bits. El proyecto `fiscal-service/src/FiscalService/FiscalService.csproj` fija `net8.0-windows`, `PlatformTarget=x86` y `RuntimeIdentifier=win-x86`.

```bat
npm run build:service
```

Eso publica un runtime autocontenido en `resources/fiscal-service/FiscalService.exe`. Esa carpeta está en `.gitignore` y se regenera con el script. Al empaquetar, electron-builder la copia a `resources/fiscal-service` del instalador (`extraResources` en `electron-builder.yml`).

En desarrollo el manager busca el exe en este orden:

1. `resources/fiscal-service/FiscalService.exe`
2. `fiscal-service/src/FiscalService/bin/Debug/net8.0-windows/win-x86/publish/FiscalService.exe`

Si no existe, el estado pasa a `failed` y el mensaje pide ejecutar `npm run build:service`.

## Arranque

`src/main/index.ts` registra IPC, llama `manager.start()` y después abre la ventana titulada Crema Stereo POS. Al salir, `before-quit` llama `manager.stop()` y luego `app.exit(0)`.

`FiscalServiceManager` (`src/main/fiscal-service-manager.ts`):

1. Genera un token de 16 bytes en hex.
2. Mata un PID viejo guardado en `%userData%/fiscal-service.pid` si sigue vivo.
3. Prueba puertos **5050–5060** y se queda con el primero libre.
4. Lanza el exe con `--port`, `--token` y `--parent-pid` (el PID de Electron).
5. Hace polling de `GET /health` hasta 20 segundos.
6. Si responde, el estado queda en `ready` y empieza un chequeo cada 5 segundos. Tres fallos seguidos marcan `unresponsive`.

## Reinicio y apagado

- Si el proceso muere solo, se reintenta con esperas de 1 s, 3 s y 10 s. Tres caídas en dos minutos dejan el estado en `failed`.
- `restart` hace un apagado ordenado y vuelve a arrancar.
- `forceRestart` mata el proceso y luego reinicia.
- El apagado ordenado envía `POST /shutdown` con el token, espera 3 segundos y, si no sale, ejecuta `taskkill /T /F`.
- `/shutdown` cierra el puerto fiscal (`CloseFpCtrl`) y detiene Kestrel.
- `ParentWatchdog` observa el PID padre. Si Electron desaparece, el servicio termina para no dejar el COM tomado.

Los logs de stdout, stderr y del manager se escriben en `%userData%/logs/fiscal-service-AAAA-MM-DD.log` y se reenvían al renderer por el evento `service:log`.

## Qué archivo hace qué

| Pieza | Rol |
| --- | --- |
| `fiscal-service/src/FiscalService/Program.cs` | Host Kestrel, token, registro de endpoints, `Encoding.RegisterProvider` para iso-8859-15 |
| `Endpoints/Connection.cs` | Puertos COM, abrir, cerrar, chequeo de impresora y gaveta, status |
| `Endpoints/RawCommands.cs` | `SendCmd`, archivo de comandos y uploads |
| `Endpoints/XReports.cs` y `ZReports.cs` | Reportes X y Z |
| `Endpoints/StatusReads.cs` | Lecturas S1–SV |
| `Endpoints/Meta.cs` | `/health`, reflexión del SDK, propiedades y `/shutdown` |
| `Printer/PrinterWorker.cs` | Una instancia `Tfhka` y una cola en hilo STA |
| `Printer/SdkInvoker.cs` | Encola la llamada y la devuelve como envelope JSON |
| `Printer/PortReset.cs` | Cierre forzado y reapertura del COM |
| `Hosting/ParentWatchdog.cs` | Sale si el proceso de Electron ya no existe |
| `lib/x86/TfhkaNet.dll` | SDK del proveedor. La copia `lib/x64` también es PE de 32 bits; el servicio usa x86 |
| `src/renderer/src/fiscal/` | Cliente HTTP, armado de documentos, catálogo y códigos de status |

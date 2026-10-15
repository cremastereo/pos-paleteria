# Diferencias entre el manual 1.4 y la DLL 1.7.6.2

El manual transcrito en [manual/](manual/00-portada-e-indice.md) describe la librería a abril de 2022. El binario que usa este servicio es **TfhkaNet 1.7.6.2** (el demo VB declara 1.7.4.3). Estas diferencias salieron de probar el servicio contra el emulador VFP HKA y hay que tenerlas en cuenta al leer el manual.

## Plataforma y clase

- Las copias de 32 y de 64 bits tienen PE i386 y `32BITREQ=true`. El servicio se publica **win-x86 self-contained**.
- .NET 8 necesita `Microsoft.Windows.Compatibility`, `System.Configuration.ConfigurationManager`, `System.IO.Ports` y `Encoding.RegisterProvider(CodePagesEncodingProvider.Instance)`. La DLL usa **iso-8859-15**.
- La clase de Venezuela es `TfhkaNet.IF.VE.Tfhka`. El ensamblado también trae otros países.
- Los nombres reales de método son PascalCase interno de la DLL: `OpenFpCtrl`, `CloseFpCtrl`, `CheckFPrinter`. El manual los escribe `OpenFpctrl`, `CloseFpctrl`, `CheckFprinter`. Los endpoints HTTP conservan el nombre del manual (`/openFpctrl`, `/checkFprinter`).

## Métodos y propiedades

- `GetX6Report` **no existe** en 1.7.6.2. `POST /getX6Report` responde `MissingMethodException`.
- Los overloads reales de Z son `GetZReport()`, `(int, int)`, `(DateTime, DateTime)` y `(string, string)`. El servicio de fechas usa `DateTime`.
- `PrinterException` no expone la propiedad pública `StatusError` en esta versión. El texto de status y error va en `Message`. El manual dice que `StatusError` retorna un `PrinterStatus`.
- La propiedad real de reintentos es `SendCmdRetryAttempts`. El manual escribe `SendCmnRetryAttempts`. La DLL también tiene `SendCmdRetryInterval`, que el manual no lista.
- El manual dice que el rango de reintentos está en milisegundos (50–10000). Conviene leer el valor real en `GET /properties` antes de asumir la unidad.

## Comportamiento observado

- Error **137** significa que no hubo respuesta. También aparece si un documento fiscal quedó abierto y las tramas siguientes no reciben ACK.
- Un segundo `OpenFpCtrl` con el puerto ya abierto lanza `SdkException`: `'PortName' cannot be set while the port is open.`
- `PrintZReport` del día exige `{ "confirm": true }`. Sin eso el endpoint responde 400 y no imprime el cierre.
- `SendFileCmd` de un archivo inexistente devolvió `-1` y no la excepción 153 que sugiere el anexo.
- `GetXReport` y `GetZReport()` pueden lanzar `IndexOutOfRange` dentro de la DLL al parsear campos IGTF. `GetX2`, `GetX4`, `GetX5` y `GetX7` respondieron bien en el emulador.
- Ítems con `"` o `#` devolvieron `false` en una corrida con documento abierto. El comentario y el ítem exento sí pasaron.
- Dos lecturas concurrentes se serializan en la cola STA. Ninguna recibió 503 por mezcla de tramas.

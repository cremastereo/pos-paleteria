# Comandos de documento

`src/renderer/src/fiscal/lib/fiscal-invoice.ts` arma las tramas ASCII que después se envían una por una con `POST /sendCmd`. El protocolo de `SendCmd` es ASCII de 7 bits: tildes, eñes y caracteres fuera de `\x20-\x7E` se normalizan o se rechazan. `sanitizeFiscalText` quita diacríticos, cambia `ñ`/`ü` y recorta al largo máximo de cada campo.

Las tasas por defecto, si todavía no se leyó S3, son exento 0, general 12 %, reducida 8 % y adicional 31 %. `ratesFromS3` las reemplaza con `Tax1`, `Tax2` y `Tax3` de `GetS3PrinterData`.

## Prefijos de ítem

Para una factura el primer carácter elige la tasa:

| Tasa | Prefijo |
| --- | --- |
| Exento | espacio |
| General | `!` |
| Reducida | `"` |
| Adicional | `#` |

Una nota de crédito usa `d` más el dígito de tasa (`0`–`3`). Una nota de débito usa `` ` `` más ese dígito.

El cuerpo del ítem es precio unitario en centavos (10 dígitos), cantidad en milésimas (8 dígitos) y el nombre (máximo 40 ASCII). Ejemplo de factura, tomado de `fiscal-service/samples/factura-demo.txt`:

```text
@COMENTARIO A PRODUCTO EN FACTURA
 000000030000001000Producto Exento
!000000050000001000Producto Tasa General
"000000070000001000Producto Tasa Reducida
#000000090000001000Producto Tasa Adicional
3
101
```

`3` es el subtotal. `101` es el cierre con el medio de pago `01` (comando `1` + dos dígitos), sin monto: la impresora cobra el resto.

## Orden que produce `buildInvoiceCommands`

1. `iR*{rif}` si hay RIF (máximo 40).
2. `iS*{razón social}` si hay nombre.
3. Hasta nueve líneas `i01`…`i09` con datos extra del cliente.
4. En nota de crédito o débito, la factura afectada es obligatoria:
   - `iF*` + número en 11 dígitos
   - `iD*` + fecha
   - `iI*` + serial de la impresora
5. Comentario opcional: `@` en factura, `A` en nota de crédito, `B` en nota de débito.
6. Un comando de ítem por producto.
7. `3` (subtotal).
8. Cierre `1NN` con el código del último pago, o `01` si no hay pagos.

`buildRemainderPayCmd` genera ese `1NN`. `buildPartialPayCmd` genera un pago parcial `2NN` más 12 dígitos (10 enteros y 2 decimales). En el emulador usado durante las pruebas, mandar monto con `1NN` dejaba el puerto sin ACK (error 137); el cierre de resto va sin monto.

Otros helpers del mismo archivo: `buildPayNameCmd` (`PE` + código + nombre de medio), `isForeignPayCode` (códigos 20–24), `lineTotals` / `invoiceTotals` y `formatMoney` en formato `es-VE`.

## Lectura para pantalla

`src/renderer/src/fiscal/lib/fiscal-report.ts` toma el objeto de un reporte X o Z y lo agrupa en bases, impuestos y contadores para mostrarlo. No habla con la impresora: solo interpreta el JSON que ya devolvió el servicio.

El catálogo `src/renderer/src/fiscal/sdk/catalog.ts` lista cada método del manual con su ruta HTTP, parámetros y atributos. `status-codes.ts` trae el anexo 1 y el anexo 2 en decimal, que es como los retorna la DLL.

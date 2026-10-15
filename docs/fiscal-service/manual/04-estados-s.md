# Estados S y PrinterException

Transcripción del manual MLJ-CINT-01, versión 1.4, fecha 02/04/2022. The Factory HKA, C.A.

Los estados S2, S2E, S21, S22, S23 y S25 devuelven el mismo tipo `S2PrinterData`. El manual repite la lista en cada uno. Se transcribe una vez y se indica el comando que distingue a cada lectura.

## Atributos de S2PrinterData

- `double AmountPayable`: monto por pagar.
- `int Condition`: condición de transacción.
- `double DataDummy`: data de relleno.
- `int NumberPaymentsMade`: cantidad de pagos realizados.
- `int QuantityArticles`: cantidad de artículos.
- `double SubTotalBases`: subtotal bases imponibles.
- `double SubTotalTax`: subtotal IVA.
- `int TypeDocument`: tipo de documento.

## 4.12. GetS1PrinterData tipo S1PrinterData

Sube al PC el estado S1 (información de parámetros generales de la impresora).

```text
S1PrinterData GetS1PrinterData() throws PrinterException
```

Retorno:

- `int AuditReportsCounter`: contador de reporte de auditoría.
- `int CashierNumber`: número de cajero activo.
- `DateTime CurrentPrinterDateTime`: fecha y hora actual de la impresora fiscal.
- `int DailyClosureCounter`: contador de cierre diario (reporte Z).
- `int LastCreditNoteNumber`: número de la última nota de crédito.
- `int LastDebitNoteNumber`: número de la última nota de débito.
- `int LastInvoiceNumber`: número de la última factura.
- `int LastNonFiscalDocNumber`: número del último documento no fiscal.
- `int QuantityNonFiscalDocuments`: cantidad de documentos no fiscales.
- `int QuantityOfCreditNotesToday`: cantidad de notas de crédito en el día.
- `int QuantityOfDebitNotesToday`: cantidad de notas débito en el día.
- `int QuantityOfInvoicesToday`: cantidad de facturas en el día.
- `string RegisteredMachineNumber`: número de registro de la impresora fiscal.
- `string RIF`: RIF de fiscalización de la impresora.
- `double TotalDailySales`: monto total de ventas diarias.

Excepción: arroja `PrinterException`.

## 4.13. GetS2PrinterData

Sube al PC el estado S2 (información general de los montos del documento en curso).

```text
S2PrinterData GetS2PrinterData() throws PrinterException
```

Retorno: `S2PrinterData`. Excepción: `PrinterException`.

## 4.14. GetS2EPrinterData

Sube al PC el estado S2E (información de los montos para exento del documento en curso).

```text
S2PrinterData GetS2EPrinterData() throws PrinterException
```

Retorno: `S2PrinterData`. Excepción: `PrinterException`.

## 4.15. GetS21PrinterData

Sube al PC el estado S21 (información de los montos para tasa 1 del documento en curso).

```text
S2PrinterData GetS21PrinterData() throws PrinterException
```

Retorno: `S2PrinterData`. Excepción: `PrinterException`.

## 4.16. GetS22PrinterData

Sube al PC el estado S22 (información de los montos para tasa 2 del documento en curso).

```text
S2PrinterData GetS22PrinterData() throws PrinterException
```

Retorno: `S2PrinterData`. Excepción: `PrinterException`.

## 4.17. GetS23PrinterData

Sube al PC el estado S23 (información de los montos para tasa 3 del documento en curso).

```text
S2PrinterData GetS23PrinterData() throws PrinterException
```

Retorno: `S2PrinterData`. Excepción: `PrinterException`.

## 4.18. GetS25PrinterData

Sube al PC el estado S25 (información de los montos para IGTF del documento en curso). Este comando se agregó en la revisión 1.4.

```text
S2PrinterData GetS25PrinterData() throws PrinterException
```

Retorno: `S2PrinterData`. Excepción: `PrinterException`.

## 4.19. GetS3PrinterData tipo S3PrinterData

Sube al PC el estado S3 (información de configuración de tasas y flags).

```text
S3PrinterData GetS3PrinterData() throws PrinterException
```

Retorno:

- `int[] AllSystemFlags`: todas las banderas.
- `double Tax1`: valor de la tasa 1 (%).
- `double Tax2`: valor de la tasa 2 (%).
- `double Tax3`: valor de la tasa 3 (%).
- `double TaxIGTF`: valor IGTF (3 %).
- `int TypeTax1`: tipo de tasa 1 (modo incluido = 1, modo excluido = 2).
- `int TypeTax2`: tipo de tasa 2 (modo incluido = 1, modo excluido = 2).
- `int TypeTax3`: tipo de tasa 3 (modo incluido = 1, modo excluido = 2).
- `int typeTaxIGTF`: tipo de IGTF (modo incluido = 1, modo excluido = 2).

Excepción: arroja `PrinterException`.

## 4.20. GetS4PrinterData tipo S4PrinterData

Sube al PC el estado S4 (información sobre los montos en los medios de pago).

```text
S4PrinterData GetS4PrinterData() throws PrinterException
```

Retorno:

- `double[] AccumulatedMountsAllMeansOfPayment`: lista de los montos acumulados de los medios de pago de la impresora fiscal, y del monto correspondiente a las donaciones.

Excepción: arroja `PrinterException`.

## 4.21. GetS5PrinterData tipo S5PrinterData

Sube al PC el estado S5 (información sobre la memoria de auditoría).

```text
S5PrinterData GetS5PrinterData() throws PrinterException
```

Retorno:

- `double AuditMemoryFreeCapacity`: disponibilidad en memoria de auditoría (MB).
- `int AuditMemoryNumber`: número de memoria de auditoría.
- `double AuditMemoryTotalCapacity`: capacidad total de la memoria de auditoría (MB).
- `int NumberRegisteredDocuments`: cantidad de documentos en la memoria de auditoría.
- `string RegisteredMachineNumber`: número de registro de la impresora fiscal.
- `string RIF`: RIF de fiscalización de la impresora.

Excepción: arroja `PrinterException`.

## 4.22. GetS6PrinterData tipo S6PrinterData

Sube al PC el estado S6 (información del modo SLIP).

```text
S6PrinterData GetS6PrinterData() throws PrinterException
```

Retorno:

- `string Bit_Facturacion`: indica la presencia de papel en la estación de facturación.
- `string Bit_Slip`: indica la presencia de papel en la estación de Slip/chequera.
- `string Bit_Validacion`: indica la presencia de papel en la estación de validación.

Excepción: arroja `PrinterException`.

## 4.23. GetS7PrinterData tipo S7PrinterData

Sube al PC el estado S7 (información del modo SLIP).

```text
S7PrinterData GetS7PrinterData() throws PrinterException
```

Retorno:

- `String MICR`: lectura del MICR del cheque.

Excepción: arroja `PrinterException`.

## 4.24. GetS8EPrinterData tipo S8EPrinterData

Sube al PC el estado S8E (información de los encabezados).

```text
S8EPrinterData GetS8EPrinterData() throws PrinterException
```

Retorno: `string Header1` … `string Header8`, encabezado líneas 1 a 8.

Excepción: arroja `PrinterException`.

## 4.25. GetS8PPrinterData tipo S8PPrinterData

Sube al PC el estado S8P (información del pie de ticket).

```text
S8PPrinterData GetS8PPrinterData() throws PrinterException
```

Retorno: `string Footer1` … `string Footer8`, pie de página líneas 1 a 8.

Excepción: arroja `PrinterException`.

## 4.26. GetSVPrinterData tipo SVPrinterData

Obtiene el estado SV (información del modelo y país de la impresora).

```text
SVPrinterData GetSVPrinterData() throws PrinterException
```

Retorno:

- `PModel Model`: lectura del modelo de la impresora.
- `PCountry Country`: lectura del país de la impresora.

Excepción: arroja `PrinterException`.

## 4.27. PrinterException

Representa un tipo de excepción que arrojan algunos métodos de creación de objetos de las estructuras anteriormente definidas cuando ocurre un error en la transacción con la impresora fiscal. Está compuesto por los siguientes elementos:

- `PrinterStatus StatusError`: retorna un objeto que contiene información del status y el error al momento de generarse la excepción.
- `Message`: contiene la descripción de la excepción arrojada.

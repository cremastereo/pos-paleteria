# Reportes X y Z

Transcripción del manual MLJ-CINT-01, versión 1.4, fecha 02/04/2022. The Factory HKA, C.A. El manual repite la lista de atributos en cada overload. Aquí se transcribe completa en cada método.

## 4.2. GetXReport tipo ReportData

Sube al PC un reporte X por medio del comando `U0X` actualizando sus valores de data.

```text
ReportData GetXReport() throws PrinterException
```

Retorno: un objeto de tipo `ReportData`.

- `double AdditionalRate3Sale`: BI tasa adicional en facturas.
- `double AdditionalRate3Tax`: IVA tasa adicional en facturas.
- `double AdditionalRateDebit`: BI tasa adicional en nota débito.
- `double AdditionalRateDevolution`: BI tasa adicional en nota de crédito.
- `double AdditionalRateTaxDebit`: IVA tasa adicional en nota débito.
- `double AdditionalRateTaxDevolution`: IVA tasa adicional en nota de crédito.
- `double FreeSalesTax`: monto tasa exento en facturas.
- `double FreeTaxDebit`: monto tasa exento en nota de débito.
- `double FreeTaxDevolution`: monto tasa exento en nota de crédito.
- `double GeneralRate1Sale`: BI tasa general en facturas.
- `double GeneralRate1Tax`: IVA tasa general en facturas.
- `double GeneralRateDebit`: BI tasa general en nota débito.
- `double GeneralRateDevolution`: BI tasa general en nota de crédito.
- `double GeneralRateTaxDebit`: IVA tasa general en nota de débito.
- `double GeneralRateTaxDevolution`: IVA tasa general en nota de crédito.
- `DateTime LastInvoiceDate`: fecha de la última factura.
- `int NumberOfLastCreditNote`: número de la última nota de crédito.
- `int NumberOfLastDebitNote`: número de la última nota de débito.
- `int NumberOfLastInvoice`: número de la última factura.
- `int NumberOfLastNonFiscal`: número del último documento no fiscal.
- `int NumberOfLastZReport`: número del último reporte Z.
- `double ReducedRate2Sale`: BI tasa reducida en facturas.
- `double ReducedRate2Tax`: IVA tasa adicional en facturas.
- `double ReducedRateDebit`: BI tasa adicional en nota débito.
- `double ReducedRateDevolution`: BI tasa adicional en nota de crédito.
- `double ReducedRateTaxDebit`: IVA tasa adicional en nota débito.
- `double ReducedRateTaxDevolution`: IVA tasa adicional en nota de crédito.
- `DateTime ZReportDate`: fecha del último reporte Z.
- `double IgtfRateSales`: BI tasa IGTF en facturas.
- `double IgtfRateTaxSales`: IVA tasa IGTF en facturas.
- `double IgtfRateDebit`: BI tasa IGTF en nota débito.
- `double IgtfRateTaxDebit`: IVA tasa IGTF en nota débito.
- `double IgtfRateDevolution`: BI tasa IGTF en nota de crédito.
- `double IgtfRateTaxDevolution`: IVA tasa IGTF en nota de crédito.

Excepción: arroja `PrinterException`.

## 4.3. GetX2Report tipo ReportData

Sube al PC un reporte X2 por medio del comando `U1X` actualizando sus valores de data.

```text
ReportData GetX2Report() throws PrinterException
```

Retorno: un objeto de tipo `ReportData` con los mismos atributos listados en GetXReport, incluidos los campos IGTF (`IgtfRateSales`, `IgtfRateTaxSales`, `IgtfRateDebit`, `IgtfRateTaxDebit`, `IgtfRateDevolution`, `IgtfRateTaxDevolution`).

Excepción: arroja `PrinterException`.

## 4.4. GetX4Report tipo AcumuladosX

Sube al PC un reporte X4 por medio del comando `U0X4` actualizando sus valores de data.

```text
AcumuladosX GetX4Report() throws PrinterException
```

Retorno: un objeto de tipo `AcumuladosX`.

- `double getFreeTax`: acumulado exento.
- `double getPerceivedTax`: acumulado percibido.
- `double getGeneralRate1`: acumulado base imponible tasa 1.
- `double getReducedRate2`: acumulado base imponible tasa 2.
- `double getAdditionalRate3`: acumulado base imponible tasa 3.
- `double getIgtfRate`: acumulado base imponible IGTF.
- `double getgeneralRate1Tax`: acumulado impuesto tasa 1.
- `double getReducedRate2Tax`: acumulado impuesto tasa 2.
- `double getgeneralRate3Tax`: acumulado impuesto tasa 3.
- `double getIgtfRateTax`: acumulado impuesto IGTF.

Excepción: arroja `PrinterException`.

## 4.5. GetX5Report tipo AcumuladosX

Sube al PC un reporte X5 por medio del comando `U0X5` actualizando sus valores de data.

```text
AcumuladosX GetX5Report() throws PrinterException
```

Retorno: un objeto de tipo `AcumuladosX` con los mismos atributos que GetX4Report (`getFreeTax`, `getPerceivedTax`, `getGeneralRate1`, `getReducedRate2`, `getAdditionalRate3`, `getIgtfRate`, `getgeneralRate1Tax`, `getReducedRate2Tax`, `getgeneralRate3Tax`, `getIgtfRateTax`).

Excepción: arroja `PrinterException`.

## 4.6. GetX6Report tipo AcumuladosX

Sube al PC un reporte X6 por medio del comando `U0X6` actualizando sus valores de data.

```text
AcumuladosX GetX6Report() throws PrinterException
```

Retorno: un objeto de tipo `AcumuladosX`. En este método el manual nombra los atributos sin el prefijo `get`.

- `double FreeTax`: acumulado exento.
- `double GeneralRate1`: acumulado base imponible tasa 1.
- `double GeneralRate2`: acumulado base imponible tasa 2.
- `double GeneralRate3`: acumulado base imponible tasa 3.
- `double GeneralRate1Tax`: acumulado impuesto tasa 1.
- `double GeneralRate2Tax`: acumulado impuesto tasa 2.
- `double GeneralRate3Tax`: acumulado impuesto tasa 3.

Excepción: arroja `PrinterException`.

## 4.7. GetX7Report tipo AcumuladosX

Sube al PC un reporte X7 por medio del comando `U0X7` actualizando sus valores de data.

```text
AcumuladosX GetX7Report() throws PrinterException
```

Retorno: un objeto de tipo `AcumuladosX` con los mismos atributos que GetX4Report.

Excepción: arroja `PrinterException`.

## 4.8. PrintXReport tipo Void

Imprime el reporte X.

```text
VOID PrintXReport() throws PrinterException
```

Excepción: arroja `PrinterException`.

## 4.9. GetZReport tipo ReportData y tipo ReportData[]

### Sin parámetros

```text
ReportData GetZReport() throws PrinterException
```

Sube al PC un reporte Z por medio del comando `U0Z` actualizando sus valores de data.

Retorno: un objeto de tipo `ReportData`. Los atributos de venta, débito, crédito, exento, tasas y contadores son los mismos que en GetXReport. Los campos IGTF, en este overload, el manual los escribe con prefijo `get`:

- `double getIgtfRateSales`: BI tasa IGTF en facturas.
- `double getIgtfRateTaxSales`: IVA tasa IGTF en facturas.
- `double getIgtfRateDebit`: BI tasa IGTF en nota débito.
- `double getIgtfRateTaxDebit`: IVA tasa IGTF en nota débito.
- `double getIgtfRateDevolution`: BI tasa IGTF en nota de crédito.
- `double getIgtfRateTaxDevolution`: IVA tasa IGTF en nota de crédito.

Excepción: arroja `PrinterException`.

### Por rango de fecha

```text
ReportData[] GetZReport(string StartDate, string EndDate) throws PrinterException
```

Realiza una lectura de memoria fiscal por rango de fecha.

Parámetros:

- `StartDate`: fecha del reporte Z inicial.
- `EndDate`: fecha del reporte Z final.

Retorno: una lista de objetos `ReportData` con la información de los reportes Z comprendidos en el intervalo. Los atributos son los mismos del `GetZReport()` sin parámetros, incluidos `getIgtfRateSales` y el resto de campos IGTF con prefijo `get`.

Excepción: arroja `PrinterException`.

### Por rango de números

```text
ReportData[] GetZReport(int StartReportNumber, int EndReportNumber) throws PrinterException
```

Realiza una lectura de memoria fiscal por rango de números.

Parámetros:

- `StartReportNumber`: número del reporte Z inicial.
- `EndReportNumber`: número de reporte Z final.

Retorno: una lista de objetos `ReportData` con los mismos atributos del overload por fecha.

Excepción: arroja `PrinterException`.

## 4.10. GetZ2Report tipo ReportData

Sube al PC un reporte Z2 por medio del comando `U1Z` actualizando sus valores de data.

```text
ReportData GetZ2Report() throws PrinterException
```

Retorno: un objeto de tipo `ReportData` con los mismos atributos de `GetZReport()`, incluidos los IGTF con prefijo `get`.

Excepción: arroja `PrinterException`.

## 4.11. PrintZReport tipo Void

### Cierre del día

```text
VOID PrintZReport() throws PrinterException
```

Imprime el reporte diario Z.

Excepción: arroja `PrinterException`.

### Histórico por números

```text
VOID PrintZReport(int StartReportNumber, int EndReportNumber) throws PrinterException
```

Imprime un histórico de reportes Z por rango de números.

Parámetros:

- `StartReportNumber`: número de reporte Z inicial.
- `EndReportNumber`: número de reporte Z final.

Excepción: arroja `PrinterException`.

### Histórico por fechas

```text
VOID PrintZReport(Date StartDate, Date EndDate) throws PrinterException
```

Imprime un histórico de reportes Z por rango de fechas.

Parámetros, tal como están impresos en el manual (el primero aparece como `StarDate`):

- `StarDate`: fecha de reporte Z inicial.
- `EndDate`: fecha de reporte Z final.

Excepción: arroja `PrinterException`.

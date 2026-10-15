export type SectionId = 'connection' | 'raw' | 'x' | 'z' | 'status'

export type ParamKind = 'string' | 'int' | 'date' | 'file' | 'cmd' | 'confirm' | 'select' | 'port'

export interface AttrDef {
  name: string
  type: string
  description: string
}

export interface ParamDef {
  name: string
  jsonName: string
  kind: ParamKind
  csharpType: string
  description: string
  required?: boolean
  options?: string[]
  allowOther?: boolean
}

export interface SdkFunction {
  id: string
  sectionId: SectionId
  section: string
  manualRef: string
  title: string
  signature: string
  description: string
  params: ParamDef[]
  returnType: string
  attributes: AttrDef[]
  exception: string | null
  endpoint: string
  bodyExample: Record<string, unknown>
  mutating?: boolean
  confirm?: boolean
  integratorNotes?: string[]
  templates?: { label: string; value: string }[]
}

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'connection', label: 'Conexión y estado' },
  { id: 'raw', label: 'Comandos crudos' },
  { id: 'x', label: 'Reportes X' },
  { id: 'z', label: 'Reportes Z' },
  { id: 'status', label: 'Estados S1–SV' }
]

const PRINTER_STATUS_ATTRS: AttrDef[] = [
  { name: 'ErrorValidity', type: 'bool', description: 'Validez del Error.' },
  { name: 'PrinterErrorCode', type: 'int', description: 'Valor entero del Error (Ver Anexo 2).' },
  { name: 'PrinterErrorDescription', type: 'string', description: 'Descripción del Error.' },
  { name: 'PrinterStatusCode', type: 'int', description: 'Valor entero del Status (Ver Anexo 1).' },
  { name: 'PrinterStatusDescription', type: 'string', description: 'Descripción del Status.' }
]

const REPORT_DATA_X: AttrDef[] = [
  { name: 'AdditionalRate3Sale', type: 'double', description: 'BI tasa adicional en facturas.' },
  { name: 'AdditionalRate3Tax', type: 'double', description: 'IVA tasa adicional en facturas.' },
  { name: 'AdditionalRateDebit', type: 'double', description: 'BI tasa adicional en nota débito.' },
  { name: 'AdditionalRateDevolution', type: 'double', description: 'BI tasa adicional en nota de crédito.' },
  { name: 'AdditionalRateTaxDebit', type: 'double', description: 'IVA Tasa Adicional en Nota Débito.' },
  { name: 'AdditionalRateTaxDevolution', type: 'double', description: 'IVA tasa adicional en nota de crédito.' },
  { name: 'FreeSalesTax', type: 'double', description: 'Monto tasa exento en facturas.' },
  { name: 'FreeTaxDebit', type: 'double', description: 'Monto tasa exento en nota de débito.' },
  { name: 'FreeTaxDevolution', type: 'double', description: 'monto tasa exento en nota de crédito.' },
  { name: 'GeneralRate1Sale', type: 'double', description: 'BI tasa general en facturas.' },
  { name: 'GeneralRate1Tax', type: 'double', description: 'IVA tasa general en facturas.' },
  { name: 'GeneralRateDebit', type: 'double', description: 'BI tasa general en nota débito.' },
  { name: 'GeneralRateDevolution', type: 'double', description: 'BI tasa general en nota de crédito.' },
  { name: 'GeneralRateTaxDebit', type: 'double', description: 'IVA tasa general en nota de débito.' },
  { name: 'GeneralRateTaxDevolution', type: 'double', description: 'IVA tasa general en nota de crédito.' },
  { name: 'LastInvoiceDate', type: 'DateTime', description: 'Fecha de la última factura.' },
  { name: 'NumberOfLastCreditNote', type: 'int', description: 'Número de la última nota de crédito.' },
  { name: 'NumberOfLastDebitNote', type: 'int', description: 'Número de la última nota de débito.' },
  { name: 'NumberOfLastInvoice', type: 'int', description: 'Número de la última factura.' },
  { name: 'NumberOfLastNonFiscal', type: 'int', description: 'Número del último documento no fiscal.' },
  { name: 'NumberOfLastZReport', type: 'int', description: 'Número del último Reporte Z.' },
  { name: 'ReducedRate2Sale', type: 'double', description: 'BI tasa reducida en facturas.' },
  { name: 'ReducedRate2Tax', type: 'double', description: 'IVA tasa adicional en facturas.' },
  { name: 'ReducedRateDebit', type: 'double', description: 'BI tasa adicional en nota débito.' },
  { name: 'ReducedRateDevolution', type: 'double', description: 'BI tasa adicional en nota de crédito.' },
  { name: 'ReducedRateTaxDebit', type: 'double', description: 'IVA Tasa Adicional en Nota Débito.' },
  { name: 'ReducedRateTaxDevolution', type: 'double', description: 'IVA tasa adicional en nota de crédito.' },
  { name: 'ZReportDate', type: 'DateTime', description: 'Fecha del último Reporte Z.' },
  { name: 'IgtfRateSales', type: 'double', description: 'BI tasa igtf en facturas.' },
  { name: 'IgtfRateTaxSales', type: 'double', description: 'IVA tasa igtf en facturas.' },
  { name: 'IgtfRateDebit', type: 'double', description: 'BI tasa igtf en nota débito.' },
  { name: 'IgtfRateTaxDebit', type: 'double', description: 'IVA Tasa igtf en Nota Débito.' },
  { name: 'IgtfRateDevolution', type: 'double', description: 'BI tasa igtf en Nota de crédito.' },
  { name: 'IgtfRateTaxDevolution', type: 'double', description: 'IVA Tasa igtf en Nota credito.' }
]

const REPORT_DATA_Z: AttrDef[] = [
  { name: 'AdditionalRate3Sale', type: 'double', description: 'BI tasa adicional en facturas' },
  { name: 'AdditionalRate3Tax', type: 'double', description: 'IVA tasa adicional en facturas' },
  { name: 'AdditionalRateDebit', type: 'double', description: 'BI tasa adicional en nota débito' },
  { name: 'AdditionalRateDevolution', type: 'double', description: 'BI tasa adicional en nota de crédito' },
  { name: 'AdditionalRateTaxDebit', type: 'double', description: 'IVA Tasa Adicional en Nota Débito' },
  { name: 'AdditionalRateTaxDevolution', type: 'double', description: 'IVA tasa adicional en nota de crédito' },
  { name: 'FreeSalesTax', type: 'double', description: 'Monto tasa exento en facturas' },
  { name: 'FreeTaxDebit', type: 'double', description: 'Monto tasa exento en nota de débito' },
  { name: 'FreeTaxDevolution', type: 'double', description: 'monto tasa exento en nota de crédito' },
  { name: 'GeneralRate1Sale', type: 'double', description: 'BI tasa general en facturas' },
  { name: 'GeneralRate1Tax', type: 'double', description: 'IVA tasa general en facturas' },
  { name: 'GeneralRateDebit', type: 'double', description: 'BI tasa general en nota débito' },
  { name: 'GeneralRateDevolution', type: 'double', description: 'BI tasa general en nota de crédito' },
  { name: 'GeneralRateTaxDebit', type: 'double', description: 'IVA tasa general en nota de débito' },
  { name: 'GeneralRateTaxDevolution', type: 'double', description: 'IVA tasa general en nota de crédito' },
  { name: 'LastInvoiceDate', type: 'DateTime', description: 'Fecha de la última factura' },
  { name: 'NumberOfLastCreditNote', type: 'int', description: 'Número de la última nota de crédito' },
  { name: 'NumberOfLastDebitNote', type: 'int', description: 'Número de la última nota de débito' },
  { name: 'NumberOfLastInvoice', type: 'int', description: 'Número de la última factura' },
  { name: 'NumberOfLastNonFiscal', type: 'int', description: 'Número del último documento no fiscal' },
  { name: 'NumberOfLastZReport', type: 'int', description: 'Número del último Reporte Z' },
  { name: 'ReducedRate2Sale', type: 'double', description: 'BI tasa reducida en facturas' },
  { name: 'ReducedRate2Tax', type: 'double', description: 'IVA tasa adicional en facturas' },
  { name: 'ReducedRateDebit', type: 'double', description: 'BI tasa adicional en nota débito' },
  { name: 'ReducedRateDevolution', type: 'double', description: 'BI tasa adicional en nota de crédito' },
  { name: 'ReducedRateTaxDebit', type: 'double', description: 'IVA Tasa Adicional en Nota Débito' },
  { name: 'ReducedRateTaxDevolution', type: 'double', description: 'IVA tasa adicional en nota de crédito' },
  { name: 'ZReportDate', type: 'DateTime', description: 'Fecha del último Reporte Z' },
  { name: 'getIgtfRateSales', type: 'double', description: 'BI tasa igtf en facturas.' },
  { name: 'getIgtfRateTaxSales', type: 'double', description: 'IVA tasa igtf en facturas.' },
  { name: 'getIgtfRateDebit', type: 'double', description: 'BI tasa igtf en Nota débito.' },
  { name: 'getIgtfRateTaxDebit', type: 'double', description: 'IVA Tasa igtf en Nota débito.' },
  { name: 'getIgtfRateDevolution', type: 'double', description: 'BI tasa igtf en Nota de crédito.' },
  { name: 'getIgtfRateTaxDevolution', type: 'double', description: 'IVA Tasa igtf en Nota credito.' }
]

const ACUM_X457: AttrDef[] = [
  { name: 'getFreeTax', type: 'double', description: 'Acumulado exento' },
  { name: 'getPerceivedTax', type: 'double', description: 'Acumulado percibido.' },
  { name: 'getGeneralRate1', type: 'double', description: 'Acumulado base imponible tasa 1.' },
  { name: 'getReducedRate2', type: 'double', description: 'Acumulado base imponible tasa 2.' },
  { name: 'getAdditionalRate3', type: 'double', description: 'Acumulado base imponible tasa 3.' },
  { name: 'getIgtfRate', type: 'double', description: 'Acumulado base imponible igtf.' },
  { name: 'getgeneralRate1Tax', type: 'double', description: 'Acumulado impuesto tasa 1.' },
  { name: 'getReducedRate2Tax', type: 'double', description: 'Acumulado impuesto tasa 2.' },
  { name: 'getgeneralRate3Tax', type: 'double', description: 'Acumulado impuesto tasa 3.' },
  { name: 'getIgtfRateTax', type: 'double', description: 'Acumulado impuesto igtf.' }
]

const ACUM_X6: AttrDef[] = [
  { name: 'FreeTax', type: 'double', description: 'Acumulado exento' },
  { name: 'GeneralRate1', type: 'double', description: 'Acumulado base imponible tasa 1.' },
  { name: 'GeneralRate2', type: 'double', description: 'Acumulado base imponible tasa 2.' },
  { name: 'GeneralRate3', type: 'double', description: 'Acumulado base imponible tasa 3.' },
  { name: 'GeneralRate1Tax', type: 'double', description: 'Acumulado impuesto tasa 1.' },
  { name: 'GeneralRate2Tax', type: 'double', description: 'Acumulado impuesto tasa 2.' },
  { name: 'GeneralRate3Tax', type: 'double', description: 'Acumulado impuesto tasa 3.' }
]

const S2_ATTRS: AttrDef[] = [
  { name: 'AmountPayable', type: 'double', description: 'Monto por pagar' },
  { name: 'Condition', type: 'int', description: 'Condición de transacción' },
  { name: 'DataDummy', type: 'double', description: 'Data de relleno' },
  { name: 'NumberPaymentsMade', type: 'int', description: 'Cantidad de pagos realizados' },
  { name: 'QuantityArticles', type: 'int', description: 'Cantidad de artículos' },
  { name: 'SubTotalBases', type: 'double', description: 'Subtotal bases imponibles' },
  { name: 'SubTotalTax', type: 'double', description: 'Subtotal IVA' },
  { name: 'TypeDocument', type: 'int', description: 'Tipo de documento' }
]

const BOOL_RET: AttrDef[] = [{ name: 'returnValue', type: 'boolean', description: 'True / False según el método.' }]

const NOTE_DLL =
  'La DLL 1.7.6.2 (x86, 32BITREQ) expone el método como OpenFpCtrl / CloseFpCtrl / CheckFPrinter (PascalCase). El servicio HTTP usa el path del plan y llama el nombre real.'
const NOTE_ACUM =
  'En la DLL 1.7.6.2 los atributos de AcumuladosX no llevan el prefijo get: FreeTax, PerceivedTax, GeneralRate1, ReducedRate2, AdditionalRate3, IgtfRate, GeneralRate1Tax, ReducedRate2Tax, AdditionalRate3Tax, IgtfRateTax.'
const NOTE_Z_IGTF =
  'En la DLL 1.7.6.2 los campos IGTF de ReportData se llaman IgtfRateSales, IgtfRateTaxSales, IgtfRateDebit, IgtfRateTaxDebit, IgtfRateDevolution, IgtfRateTaxDevolution (sin prefijo get). También existen PercibidoRateSales/Debit/Devolution.'
const NOTE_Z_OVERLOAD =
  'La DLL expone GetZReport(DateTime, DateTime) y GetZReport(string, string). El demo oficial pasa DateTime. El servicio usa el overload DateTime.'
const NOTE_X6 =
  'GetX6Report no existe en TfhkaNet.IF.VE.Tfhka 1.7.6.2. El endpoint HTTP está presente y devolverá MissingMethodException para documentar la discrepancia.'
const NOTE_S2_QTY = 'En la DLL, S2PrinterData.QuantityArticles es Int64, no int.'
const NOTE_PROPS =
  'La propiedad documentada SendCmnRetryAttempts se llama SendCmdRetryAttempts. Existe además SendCmdRetryInterval. OpenFpCtrl tiene overload (string Puerto, int Baudios).'

function f(partial: SdkFunction): SdkFunction {
  return partial
}

export const CATALOG: SdkFunction[] = [
  f({
    id: 'openFpctrl',
    sectionId: 'connection',
    section: 'Conexión y estado del puerto',
    manualRef: '2.1',
    title: 'OpenFpctrl',
    signature: 'BOOLEAN OpenFpctrl(String IpPortName)',
    description:
      'Permite realizar la apertura del puerto de comunicaciones por el cual se establecerá comunicación con la impresora. Este método se ejecuta en el constructor único de la clase, pero puede ser ejecutado nuevamente de ser requerido.',
    params: [
      {
        name: 'IpPortName',
        jsonName: 'portName',
        kind: 'port',
        csharpType: 'String',
        description: 'Nombre del puerto COM a abrir.',
        required: true
      }
    ],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: Puerto Abierto. False: Falla en apertura' }
    ],
    exception: null,
    endpoint: '/openFpctrl',
    bodyExample: { portName: 'COM99' },
    integratorNotes: [NOTE_DLL, NOTE_PROPS]
  }),
  f({
    id: 'closeFpctrl',
    sectionId: 'connection',
    section: 'Conexión y estado del puerto',
    manualRef: '2.2',
    title: 'CloseFpctrl',
    signature: 'VOID CloseFpctrl()',
    description: 'Permite cerrar del puerto COM asociado, abierto anteriormente',
    params: [],
    returnType: 'void',
    attributes: [],
    exception: null,
    endpoint: '/closeFpctrl',
    bodyExample: {}
  }),
  f({
    id: 'checkFprinter',
    sectionId: 'connection',
    section: 'Conexión y estado del puerto',
    manualRef: '2.3',
    title: 'CheckFprinter',
    signature: 'BOOLEAN CheckFprinter()',
    description: 'Permite verificar si la impresora está conectada al PC.',
    params: [],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: impresora conectada. False: impresora no detectada.' }
    ],
    exception: null,
    endpoint: '/checkFprinter',
    bodyExample: {},
    integratorNotes: [NOTE_DLL]
  }),
  f({
    id: 'checkDrawer',
    sectionId: 'connection',
    section: 'Conexión y estado del puerto',
    manualRef: '2.4',
    title: 'CheckDrawer',
    signature: 'BOOLEAN CheckDrawer()',
    description: 'Permite comprobar si la gaveta de dinero está conectada al PC.',
    params: [],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: Gaveta conectada. False: Gaveta no detectada.' }
    ],
    exception: null,
    endpoint: '/checkDrawer',
    bodyExample: {}
  }),
  f({
    id: 'getPrinterStatus',
    sectionId: 'connection',
    section: 'Conexión y estado del puerto',
    manualRef: '4.1',
    title: 'GetPrinterStatus',
    signature: 'PrinterStatus GetPrinterStatus()',
    description:
      'Obtiene un reporte del Status y Error de la impresora en un objeto del tipo PrinterStatus que contiene el código y una descripción tanto para el Status como para el Error actual.',
    params: [],
    returnType: 'PrinterStatus',
    attributes: PRINTER_STATUS_ATTRS,
    exception: null,
    endpoint: '/getPrinterStatus',
    bodyExample: {}
  }),
  f({
    id: 'readFpStatus',
    sectionId: 'connection',
    section: 'Conexión y estado del puerto',
    manualRef: '2.5',
    title: 'ReadFpStatus',
    signature: 'BOOLEAN ReadFpStatus()',
    description:
      'Permite leer las variables de estado y error de la impresora. Al ejecutar este método se establece el valor de la variable tipo String Estado. (Ver Anexos 1 y 2). IMPORTANTE: Este método está obsoleto y no se recomienda su uso, será eliminado en futuras versiones de la librería, use método GetPrinterStatus() descrito más adelante.',
    params: [],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: Método ejecutado exitosamente. False: Error en ejecución del método' },
      { name: 'Estado', type: 'string', description: 'Descripción del estado en el que se encuentra la impresora.' }
    ],
    exception: null,
    endpoint: '/readFpStatus',
    bodyExample: {}
  }),
  f({
    id: 'sendCmd',
    sectionId: 'raw',
    section: 'Comandos crudos',
    manualRef: '2.6',
    title: 'SendCmd',
    signature: 'BOOL SendCmd(String Cmd)',
    description:
      'Permite realizar el envío de comandos hacia la impresora, en forma de tramas de caracteres ASCII, tal como es descrito en los manuales de integración de las respectivas impresoras, y en el manual general de protocolos y comandos del protocolo TFHKA.',
    params: [
      {
        name: 'cmd',
        jsonName: 'cmd',
        kind: 'string',
        csharpType: 'String',
        description: 'trama de comando en ASCII que se enviará a la impresora.',
        required: true
      }
    ],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: Método ejecutado exitosamente. False: Error en ejecución del método.' }
    ],
    exception: null,
    endpoint: '/sendCmd',
    bodyExample: { cmd: '7' },
    mutating: true,
    templates: [
      { label: 'Comentario factura', value: '@COMENTARIO A PRODUCTO EN FACTURA' },
      { label: 'Ítem exento', value: ' 000000030000001000Producto Exento' },
      { label: 'Ítem tasa general', value: '!000000050000001000Producto Tasa General' },
      { label: 'Ítem tasa reducida', value: '"000000070000001000Producto Tasa Reducida' },
      { label: 'Ítem tasa adicional', value: '#000000090000001000Producto Tasa Adicional' },
      { label: 'Subtotal (3)', value: '3' },
      { label: 'Pago 101', value: '101' },
      { label: 'Pago IGTF 120', value: '120' },
      { label: 'Pago 199', value: '199' },
      { label: 'DNF línea 80$', value: '80$Documento de Prueba' },
      { label: 'DNF fin 81', value: '81 Fin del Documento no Fiscal' },
      { label: 'RIF cliente', value: 'iR*21.122.012' },
      { label: 'Razón social', value: 'iS*Chev Chellios' },
      { label: 'Comando inválido ZZZ', value: 'ZZZ' }
    ]
  }),
  f({
    id: 'sendFileCmd',
    sectionId: 'raw',
    section: 'Comandos crudos',
    manualRef: '2.7',
    title: 'SendFileCmd',
    signature: 'INT SendFileCmd(String file)',
    description: 'Permite realizar el envío de un archivo de lotes de comando hacia la impresora.',
    params: [
      {
        name: 'rutaFile',
        jsonName: 'filePath',
        kind: 'file',
        csharpType: 'String',
        description: 'ruta en la cual se encuentra el archivo de comandos por lote que se enviará a la impresora.',
        required: true
      }
    ],
    returnType: 'int',
    attributes: [
      { name: 'returnValue', type: 'int', description: 'Número de líneas del archivo de lotes de comandos ejecutadas exitosamente.' },
      { name: 'fileLineCount', type: 'int', description: 'Líneas leídas del archivo en disco (agregado por el servicio).' }
    ],
    exception: null,
    endpoint: '/sendFileCmd',
    bodyExample: { filePath: 'C:\\\\ruta\\\\dnf-demo.txt' },
    mutating: true
  }),
  f({
    id: 'uploadReportCmd',
    sectionId: 'raw',
    section: 'Comandos crudos',
    manualRef: '2.8',
    title: 'UploadReportCmd',
    signature: 'BOOLEAN UploadReportCmd(String cmd, String file)',
    description: 'Permite almacenar en un archivo de texto simple, un reporte de la impresora.',
    params: [
      {
        name: 'cmd',
        jsonName: 'cmd',
        kind: 'select',
        csharpType: 'String',
        description: 'tipo de reporte a solicitar. Los reportes que pueden ser solicitados son los siguientes (consultar Manual de Protocolos y Comandos): U0X, U0Z, U1Z, U1X.',
        required: true,
        options: ['U0X', 'U0Z', 'U1Z', 'U1X'],
        allowOther: true
      },
      {
        name: 'file',
        jsonName: 'filePath',
        kind: 'file',
        csharpType: 'String',
        description: 'ruta del archivo donde se almacenará el reporte solicitado.'
      }
    ],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: Método ejecutado exitosamente. False: Error en ejecución del método.' },
      { name: 'fileContent', type: 'string', description: 'Contenido del archivo generado (agregado por el servicio).' }
    ],
    exception: null,
    endpoint: '/uploadReportCmd',
    bodyExample: { cmd: 'U0X', filePath: '' }
  }),
  f({
    id: 'uploadStatusCmd',
    sectionId: 'raw',
    section: 'Comandos crudos',
    manualRef: '2.9',
    title: 'UploadStatusCmd',
    signature: 'BOOLEAN UploadStatusCmd(String cmd, String file)',
    description: 'Esta función permite almacenar en un archivo de texto simple, un status de la impresora.',
    params: [
      {
        name: 'cmd',
        jsonName: 'cmd',
        kind: 'select',
        csharpType: 'String',
        description: 'tipo de Status a solicitar. Los Status que pueden ser solicitados son los siguientes (consultar Manual de Protocolos y Comandos): S1, S2, S3, S4, S5, S8E, S8P.',
        required: true,
        options: ['S1', 'S2', 'S3', 'S4', 'S5', 'S8E', 'S8P'],
        allowOther: true
      },
      {
        name: 'file',
        jsonName: 'filePath',
        kind: 'file',
        csharpType: 'String',
        description: 'ruta del archivo donde se almacenará el Status solicitado.'
      }
    ],
    returnType: 'boolean',
    attributes: [
      { name: 'returnValue', type: 'boolean', description: 'True: Método ejecutado exitosamente. False: Error en ejecución del método.' },
      { name: 'fileContent', type: 'string', description: 'Contenido del archivo generado (agregado por el servicio).' }
    ],
    exception: null,
    endpoint: '/uploadStatusCmd',
    bodyExample: { cmd: 'S1', filePath: '' }
  }),
  ...xReports(),
  ...zReports(),
  ...statusReads()
]

function xReports(): SdkFunction[] {
  const x = (
    id: string,
    ref: string,
    title: string,
    sig: string,
    desc: string,
    ret: string,
    attrs: AttrDef[],
    extra?: Partial<SdkFunction>
  ): SdkFunction =>
    f({
      id,
      sectionId: 'x',
      section: 'Reportes X (sin cierre)',
      manualRef: ref,
      title,
      signature: sig,
      description: desc,
      params: [],
      returnType: ret,
      attributes: attrs,
      exception: 'Arroja la excepción PrinterException',
      endpoint: `/${id}`,
      bodyExample: {},
      ...extra
    })
  return [
    x('getXReport', '4.2', 'GetXReport', 'ReportData GetXReport() throws PrinterException', 'Sube al PC un Reporte X por medio del comando “U0X” actualizando sus valores de data.', 'ReportData', REPORT_DATA_X),
    x('getX2Report', '4.3', 'GetX2Report', 'ReportData GetX2Report() throws PrinterException', 'Sube al PC un reporte X2 por medio del comando “U1X” actualizando sus valores de data.', 'ReportData', REPORT_DATA_X),
    x('getX4Report', '4.4', 'GetX4Report', 'AcumuladosX GetX4Report() throws PrinterException', 'Sube al PC un reporte X4 por medio del comando “U0X4” actualizando sus valores de data.', 'AcumuladosX', ACUM_X457, { integratorNotes: [NOTE_ACUM] }),
    x('getX5Report', '4.5', 'GetX5Report', 'AcumuladosX GetX5Report() throws PrinterException', 'Sube al PC un reporte X5 por medio del comando “U0X5” actualizando sus valores de data.', 'AcumuladosX', ACUM_X457, { integratorNotes: [NOTE_ACUM] }),
    x('getX6Report', '4.6', 'GetX6Report', 'AcumuladosX GetX6Report() throws PrinterException', 'Sube al PC un reporte X6 por medio del comando “U0X6” actualizando sus valores de data.', 'AcumuladosX', ACUM_X6, { integratorNotes: [NOTE_X6] }),
    x('getX7Report', '4.7', 'GetX7Report', 'AcumuladosX GetX7Report() throws PrinterException', 'Sube al PC un reporte X7 por medio del comando “U0X7” actualizando sus valores de data.', 'AcumuladosX', ACUM_X457, { integratorNotes: [NOTE_ACUM] }),
    x('printXReport', '4.8', 'PrintXReport', 'VOID PrintXReport() throws PrinterException', 'Imprime el Reporte X', 'void', [], { mutating: true })
  ]
}

function zReports(): SdkFunction[] {
  return [
    f({
      id: 'getZReport',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.9',
      title: 'GetZReport',
      signature: 'ReportData GetZReport() throws PrinterException',
      description: 'Sube al PC un Reporte Z por medio del comando “U0Z” actualizando sus valores de data.',
      params: [],
      returnType: 'ReportData',
      attributes: REPORT_DATA_Z,
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getZReport',
      bodyExample: {},
      integratorNotes: [NOTE_Z_IGTF]
    }),
    f({
      id: 'getZReportByDate',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.9',
      title: 'GetZReport (rango de fechas)',
      signature: 'ReportData[] GetZReport(string StartDate, string EndDate) throws PrinterException',
      description: 'Realiza una lectura de memoria fiscal por rango de fecha.',
      params: [
        { name: 'StartDate', jsonName: 'startDate', kind: 'date', csharpType: 'string', description: 'Fecha del reporte Z inicial.', required: true },
        { name: 'EndDate', jsonName: 'endDate', kind: 'date', csharpType: 'string', description: 'Fecha de reporte Z final.', required: true }
      ],
      returnType: 'ReportData[]',
      attributes: REPORT_DATA_Z,
      exception: 'Arroja la excepción PrinterException',
      endpoint: '/getZReportByDate',
      bodyExample: { startDate: '2026-09-27', endDate: '2026-09-27' },
      integratorNotes: [NOTE_Z_OVERLOAD, NOTE_Z_IGTF]
    }),
    f({
      id: 'getZReportByNumber',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.9',
      title: 'GetZReport (rango de número)',
      signature: 'ReportData[] GetZReport(int StartReportNumber, int EndReportNumber) throws PrinterException',
      description: 'Realiza una lectura de memoria fiscal por rango de números.',
      params: [
        { name: 'StartReportNumber', jsonName: 'startNumber', kind: 'int', csharpType: 'int', description: 'Número del reporte Z inicial.', required: true },
        { name: 'EndReportNumber', jsonName: 'endNumber', kind: 'int', csharpType: 'int', description: 'Número de reporte Z final.', required: true }
      ],
      returnType: 'ReportData[]',
      attributes: REPORT_DATA_Z,
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getZReportByNumber',
      bodyExample: { startNumber: 1, endNumber: 2 },
      integratorNotes: [NOTE_Z_IGTF]
    }),
    f({
      id: 'getZ2Report',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.10',
      title: 'GetZ2Report',
      signature: 'ReportData GetZ2Report() throws PrinterException',
      description: 'Sube al PC un reporte Z2 por medio del comando “U1Z” actualizando sus valores de data.',
      params: [],
      returnType: 'ReportData',
      attributes: REPORT_DATA_Z,
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getZ2Report',
      bodyExample: {},
      integratorNotes: [NOTE_Z_IGTF]
    }),
    f({
      id: 'printZReport',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.11',
      title: 'PrintZReport',
      signature: 'VOID PrintZReport() throws PrinterException',
      description: 'Imprime el Reporte Diario Z',
      params: [
        { name: 'confirm', jsonName: 'confirm', kind: 'confirm', csharpType: 'bool', description: 'Debe ser true. Cierre diario (irreversible en impresora real).', required: true }
      ],
      returnType: 'void',
      attributes: [],
      exception: 'Arroja la excepción PrinterException',
      endpoint: '/printZReport',
      bodyExample: { confirm: true },
      mutating: true,
      confirm: true
    }),
    f({
      id: 'printZReportByNumber',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.11',
      title: 'PrintZReport (rango de número)',
      signature: 'VOID PrintZReport(int StartReportNumber, int EndReportNumber) throws PrinterException',
      description: 'Imprime un histórico de Reportes Z por rango de números',
      params: [
        { name: 'StartReportNumber', jsonName: 'startNumber', kind: 'int', csharpType: 'int', description: 'Número de reporte Z inicial.', required: true },
        { name: 'EndReportNumber', jsonName: 'endNumber', kind: 'int', csharpType: 'int', description: 'Número de reporte Z final.', required: true }
      ],
      returnType: 'void',
      attributes: [],
      exception: 'Arroja la excepción PrinterException',
      endpoint: '/printZReportByNumber',
      bodyExample: { startNumber: 1, endNumber: 1 },
      mutating: true,
      confirm: true
    }),
    f({
      id: 'printZReportByDate',
      sectionId: 'z',
      section: 'Reportes Z (cierre diario)',
      manualRef: '4.11',
      title: 'PrintZReport (rango de fechas)',
      signature: 'VOID PrintZReport(Date StartDate, Date EndDate) throws PrinterException',
      description: 'Imprime un histórico de reportes Z por rango de fechas',
      params: [
        { name: 'StarDate', jsonName: 'startDate', kind: 'date', csharpType: 'Date', description: 'Fecha de reporte Z inicial.', required: true },
        { name: 'EndDate', jsonName: 'endDate', kind: 'date', csharpType: 'Date', description: 'Fecha de reporte Z final.', required: true }
      ],
      returnType: 'void',
      attributes: [],
      exception: 'Arroja la excepción PrinterException',
      endpoint: '/printZReportByDate',
      bodyExample: { startDate: '2026-09-27', endDate: '2026-09-27' },
      mutating: true,
      confirm: true,
      integratorNotes: [NOTE_Z_OVERLOAD]
    })
  ]
}

function statusReads(): SdkFunction[] {
  const s2 = (id: string, ref: string, title: string, desc: string): SdkFunction =>
    f({
      id,
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: ref,
      title,
      signature: `S2PrinterData ${title}() throws PrinterException`,
      description: desc,
      params: [],
      returnType: 'S2PrinterData',
      attributes: S2_ATTRS,
      exception: 'Arroja la excepción PrinterException.',
      endpoint: `/${id}`,
      bodyExample: {},
      integratorNotes: [NOTE_S2_QTY]
    })
  return [
    f({
      id: 'getS1PrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.12',
      title: 'GetS1PrinterData',
      signature: 'S1PrinterData GetS1PrinterData() throws PrinterException',
      description: 'Sube al PC el estado S1 (información de parámetros generales de la impresora).',
      params: [],
      returnType: 'S1PrinterData',
      attributes: [
        { name: 'AuditReportsCounter', type: 'int', description: 'Contador de reporte de auditoría' },
        { name: 'CashierNumber', type: 'int', description: 'Número de cajero activo' },
        { name: 'CurrentPrinterDateTime', type: 'DateTime', description: 'Fecha y hora actual de la impresora fiscal' },
        { name: 'DailyClosureCounter', type: 'int', description: 'Contador de cierre diario (Reporte Z)' },
        { name: 'LastCreditNoteNumber', type: 'int', description: 'Número de la última nota de crédito' },
        { name: 'LastDebitNoteNumber', type: 'int', description: 'Número de la última nota de débito' },
        { name: 'LastInvoiceNumber', type: 'int', description: 'Número de la última factura' },
        { name: 'LastNonFiscalDocNumber', type: 'int', description: 'Número del último documento no fiscal' },
        { name: 'QuantityNonFiscalDocuments', type: 'int', description: 'Cantidad de documentos no fiscales' },
        { name: 'QuantityOfCreditNotesToday', type: 'int', description: 'Cantidad de notas de crédito en el día' },
        { name: 'QuantityOfDebitNotesToday', type: 'int', description: 'Cantidad de notas débito en el día' },
        { name: 'QuantityOfInvoicesToday', type: 'int', description: 'Cantidad de facturas en el día' },
        { name: 'RegisteredMachineNumber', type: 'string', description: 'Número de registro de la impresora fiscal' },
        { name: 'RIF', type: 'string', description: 'RIF de fiscalización de la impresora' },
        { name: 'TotalDailySales', type: 'double', description: 'Monto total de ventas diarias' }
      ],
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS1PrinterData',
      bodyExample: {}
    }),
    s2('getS2PrinterData', '4.13', 'GetS2PrinterData', 'Sube al PC el estado S2 (información general de los montos del documento en curso).'),
    s2('getS2EPrinterData', '4.14', 'GetS2EPrinterData', 'Sube al PC el estado S2E (información de los montos para exento del documento en curso).'),
    s2('getS21PrinterData', '4.15', 'GetS21PrinterData', 'Sube al PC el estado S21 (información de los montos para tasa 1 del documento en curso).'),
    s2('getS22PrinterData', '4.16', 'GetS22PrinterData', 'Sube al PC el estado S22 (información de los montos para tasa 2 del documento en curso).'),
    s2('getS23PrinterData', '4.17', 'GetS23PrinterData', 'Sube al PC el estado S23 (información de los montos para tasa 3 del documento en curso).'),
    s2('getS25PrinterData', '4.18', 'GetS25PrinterData', 'Sube al PC el estado S25 (información de los montos para IGTF del documento en curso).'),
    f({
      id: 'getS3PrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.19',
      title: 'GetS3PrinterData',
      signature: 'S3PrinterData GetS3PrinterData() throws PrinterException',
      description: 'Sube al PC el estado S3 (información de configuración de tasas y flags).',
      params: [],
      returnType: 'S3PrinterData',
      attributes: [
        { name: 'AllSystemFlags', type: 'int[]', description: 'Todas las banderas' },
        { name: 'Tax1', type: 'double', description: 'Valor de la tasa 1 (%)' },
        { name: 'Tax2', type: 'double', description: 'Valor de la tasa 2 (%)' },
        { name: 'Tax3', type: 'double', description: 'Valor de la tasa 3 (%)' },
        { name: 'TaxIGTF', type: 'double', description: 'Valor igtf (3%)' },
        { name: 'TypeTax1', type: 'int', description: 'Tipo de tasa 1 (Modo Incluido = 1, Modo Excluido = 2)' },
        { name: 'TypeTax2', type: 'int', description: 'Tipo de tasa 2 (Modo Incluido = 1, Modo Excluido = 2)' },
        { name: 'TypeTax3', type: 'int', description: 'Tipo de tasa 3 (Modo Incluido = 1, Modo Excluido = 2)' },
        { name: 'typeTaxIGTF', type: 'int', description: 'Tipo de igtf (Modo Incluido = 1, Modo Excluido = 2)' }
      ],
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS3PrinterData',
      bodyExample: {},
      integratorNotes: ['En la DLL el atributo se llama TypeTaxIGTF (T mayúscula), no typeTaxIGTF.']
    }),
    f({
      id: 'getS4PrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.20',
      title: 'GetS4PrinterData',
      signature: 'S4PrinterData GetS4PrinterData() throws PrinterException',
      description: 'Sube al PC el estado S4 (información sobre los montos en los medios de pago).',
      params: [],
      returnType: 'S4PrinterData',
      attributes: [
        {
          name: 'AccumulatedMountsAllMeansOfPayment',
          type: 'double[]',
          description: 'Lista de los montos acumulados de los medios de pagos de la impresora fiscal, y del monto correspondiente a las donaciones.'
        }
      ],
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS4PrinterData',
      bodyExample: {}
    }),
    f({
      id: 'getS5PrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.21',
      title: 'GetS5PrinterData',
      signature: 'S5PrinterData GetS5PrinterData() throws PrinterException',
      description: 'Sube al PC el estado S5 (información sobre la memoria de auditoria).',
      params: [],
      returnType: 'S5PrinterData',
      attributes: [
        { name: 'AuditMemoryFreeCapacity', type: 'double', description: 'Disponibilidad en memoria de auditoria (MB)' },
        { name: 'AuditMemoryNumber', type: 'int', description: 'Número de memoria de auditoria' },
        { name: 'AuditMemoryTotalCapacity', type: 'double', description: 'Capacidad total de la memoria de auditoria (MB)' },
        { name: 'NumberRegisteredDocuments', type: 'int', description: 'Cantidad Documentos en la memoria de auditoria' },
        { name: 'RegisteredMachineNumber', type: 'string', description: 'Número de registro de la impresora fiscal' },
        { name: 'RIF', type: 'string', description: 'RIF de fiscalización de la impresora' }
      ],
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS5PrinterData',
      bodyExample: {}
    }),
    f({
      id: 'getS6PrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.22',
      title: 'GetS6PrinterData',
      signature: 'S6PrinterData GetS6PrinterData() throws PrinterException',
      description: 'Sube al PC el estado S6 (información del modo SLIP).',
      params: [],
      returnType: 'S6PrinterData',
      attributes: [
        { name: 'Bit_Facturacion', type: 'string', description: 'Indica la presencia de papel en la estación de facturación' },
        { name: 'Bit_Slip', type: 'string', description: 'Indica la presencia de papel en la estación de Slip/Chequera' },
        { name: 'Bit_Validacion', type: 'string', description: 'Indica la presencia de papel en la estación de Validación' }
      ],
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS6PrinterData',
      bodyExample: {}
    }),
    f({
      id: 'getS7PrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.23',
      title: 'GetS7PrinterData',
      signature: 'S7PrinterData GetS7PrinterData() throws PrinterException',
      description: 'Sube al PC el estado S7 (información del modo SLIP).',
      params: [],
      returnType: 'S7PrinterData',
      attributes: [{ name: 'MICR', type: 'String', description: 'Lectura del MICR del cheque' }],
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS7PrinterData',
      bodyExample: {}
    }),
    f({
      id: 'getS8EPrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.24',
      title: 'GetS8EPrinterData',
      signature: 'S8EPrinterData GetS8EPrinterData() throws PrinterException',
      description: 'Sube al PC el estado S8E (información de los encabezados).',
      params: [],
      returnType: 'S8EPrinterData',
      attributes: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
        name: `Header${n}`,
        type: 'string',
        description: `Encabezado, línea número ${n}`
      })),
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS8EPrinterData',
      bodyExample: {}
    }),
    f({
      id: 'getS8PPrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.25',
      title: 'GetS8PPrinterData',
      signature: 'S8PPrinterData GetS8PPrinterData() throws PrinterException',
      description: 'Sube al PC el estado S8P (información del pie de ticket).',
      params: [],
      returnType: 'S8PPrinterData',
      attributes: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
        name: `Footer${n}`,
        type: 'string',
        description: `Pie de página, línea número ${n}`
      })),
      exception: 'Arroja la excepción PrinterException.',
      endpoint: '/getS8PPrinterData',
      bodyExample: {}
    }),
    f({
      id: 'getSVPrinterData',
      sectionId: 'status',
      section: 'Lecturas de estado (S1 a S8P, SV)',
      manualRef: '4.26',
      title: 'GetSVPrinterData',
      signature: 'SVPrinterData GetSVPrinterData() throws PrinterException',
      description: 'Obtiene el estado SV (información del modelo y país de la impresora).',
      params: [],
      returnType: 'SVPrinterData',
      attributes: [
        { name: 'Model', type: 'PModel', description: 'Lectura del modelo de la impresora' },
        { name: 'Country', type: 'PCountry', description: 'Lectura del país de la impresora' }
      ],
      exception: 'Arroja la excepción PrinterException',
      endpoint: '/getSVPrinterData',
      bodyExample: {}
    })
  ]
}

export const TFHKA_PROPERTIES = [
  { name: 'ComPort', type: 'string', description: 'Nombre del puerto de comunicación.' },
  { name: 'Estado', type: 'string', description: 'Descripción del estado en el que se encuentra la impresora.' },
  {
    name: 'SendCmnRetryAttempts',
    type: 'Int',
    description:
      'Número de reintentos cuando no se procesa un método correctamente o recibe NAK. (Valor en Milisegundos). Rango permitido: 50 - 10000 (0,05 a 10 segundos).'
  },
  { name: 'SerialPortDataReady', type: 'bool', description: 'Indica si el puerto de comunicación está listo para recibir información.' },
  { name: 'SerialPortInputBuffer', type: 'Byte[]', description: 'Buffer de entrada de datos por el puerto serial.' },
  {
    name: 'SerialPortReceiveTimeout',
    type: 'Int',
    description: 'Tiempo máximo para la ejecución de un método. (Valor en Segundos). Rango permitido: 5 - 180.'
  },
  { name: 'Status_Error', type: 'String', description: 'Descripción del estado y error en el que se encuentra la impresora.' },
  { name: 'StatusPort', type: 'Bool', description: 'Indica si el puerto de comunicación está abierto o cerrado.' }
]

export const PRINTER_EXCEPTION_DOC = {
  manualRef: '4.27',
  description:
    'Representa un tipo de excepción que arrojan algunos métodos de creación de objetos de las estructuras anteriormente definidas cuando ocurre un error en la transacción con la impresora fiscal. Está compuesto por los siguientes elementos:',
  attributes: [
    {
      name: 'StatusError',
      type: 'PrinterStatus',
      description: 'Retorna un objeto que contiene información del Status y el Error al momento de generarse la excepción.'
    },
    { name: 'Message', type: 'string', description: 'Contiene la descripción de la excepción arrojada' }
  ]
}

export function getFunction(id: string) {
  return CATALOG.find((x) => x.id === id)
}

export function attrMap(fn: SdkFunction) {
  const map = new Map<string, string>()
  for (const a of fn.attributes) {
    map.set(a.name, a.description)
    map.set(a.name.toLowerCase(), a.description)
  }
  return map
}

void BOOL_RET

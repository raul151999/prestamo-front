export interface Prestamo {
    idPrestamo: number;
    dniCliente: string;
    nombreCliente: string;
    apellidoCliente: string;
    direccionCliente: string;
    montoPrestamo: number;
    interesAplicado: number;  // porcentaje de interés, por ejemplo 10%
    plazoMeses: number;  // duración del préstamo en meses
    montoTotal: number;  // monto total a pagar (prestamo + interes)
    deudaRestante: number;  // monto que queda por pagar
    estado: string;  // "activo", "pagado", etc.
    fechaInicio: string;  // fecha de creación del préstamo
    fechaFinal: string;
    editandoEstado?: boolean;
  }
  
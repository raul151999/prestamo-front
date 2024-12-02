import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prestamo } from './Interfaces/Prestamo';
import { PrestamoService } from './Services/prestamo.service';
import { DniService } from './Services/dni.service';
import { RucService } from './Services/ruc.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule]
})
export class AppComponent implements OnInit {
  listaPrestamos: any[] = [];
  agregarPrestamo: FormGroup;
  loginForm: FormGroup;
  isLoggedIn: boolean = false; // Variable para controlar el estado de inicio de sesión
  showChangePasswordModal: boolean = false; // Controla la visibilidad del modal de cambio de contraseña
  title = 'AppPrestamos';
  dni: string = '';
  ruc: string = '';
  dniInvalido = false;
  resultado: any;
  resultadoruc: any;
  respuestaDni: any;
  errorMessage: string = '';
  mensaje: string = '';
  cliente: any = null;
  cuotaMensual: string = '0.0';  
  totalIntereses: string = '0.0';
  changePasswordForm!: FormGroup;
  isChangePasswordModalOpen: boolean = false;
  

  constructor(
    private prestamoService: PrestamoService,
    private fb: FormBuilder,
    private dniService: DniService,
    private rucService: RucService,
  ) {
    this.agregarPrestamo = this.fb.group({
      dniCliente: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern('^[0-9]*$')]],
      emailCliente: ['', [Validators.required, Validators.email]],
      montoPrestamo: ['', [Validators.required, Validators.min(1)]],
      interesAplicado: [{ value: '', disabled: true }, Validators.required],
      plazoMeses: ['', [Validators.required, Validators.min(1)]],
      montoTotal: [{ value: '', disabled: true }, Validators.required],
      deudaRestante: [{ value: '', disabled: true }, Validators.required],
      estado: [{ value: 'ACTIVO', disabled: true }, Validators.required],
      fechaInicio: [{ value: this.obtenerFechaActualDDMMYYYY(), disabled: true }, Validators.required],
      fechaFinal: [{ value: '', disabled: true }, Validators.required],
    });

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    }, { autocomplete: 'off' });
  }
  // Convertir fecha de formato yyyy-mm-dd a dd-mm-yyyy
  convertirAFormatoDDMMYYYY(fecha: string): string {
  const [year, month, day] = fecha.split('-');
  return `${day}-${month}-${year}`;
}

// Convertir fecha de formato dd-mm-yyyy a yyyy-mm-dd para almacenamiento y procesamiento
  convertirAFormatoYYYYMMDD(fecha: string): string {
  const [day, month, year] = fecha.split('-');
  return `${year}-${month}-${day}`;
}

  // Obtener la fecha actual en formato dd-mm-yyyy
  obtenerFechaActualDDMMYYYY(): string {
  const fechaActual = new Date();
  const day = String(fechaActual.getDate()).padStart(2, '0');
  const month = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son base 0 en JS
  const year = fechaActual.getFullYear();
  return `${day}-${month}-${year}`;
}

  // Método para sumar meses a una fecha manejando correctamente los meses con diferentes cantidades de días
  sumarMeses(fecha: Date, meses: number): Date {
  const fechaFinal = new Date(fecha);
  const diaInicial = fecha.getDate();

  // Sumar los meses
  fechaFinal.setMonth(fecha.getMonth() + meses);

  // Si el día original no está en el nuevo mes, ajustar al último día del mes
  if (fechaFinal.getDate() < diaInicial) {
    fechaFinal.setDate(0); // Va al último día del mes anterior
  }

  return fechaFinal;
}
openChangePasswordModal(): void {
  this.isChangePasswordModalOpen = true;
}
closeChangePasswordModal(): void {
  this.isChangePasswordModalOpen = false;
}
onChangePassword() {
  if (this.changePasswordForm.valid) {
    // Aquí iría la lógica para cambiar la contraseña
    window.alert('¡Contraseña cambiada con éxito!');
    this.closeChangePasswordModal();
  } else {
    window.alert('Por favor, revisa los errores y vuelve a intentar.');
  }
}

passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
  const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
}
  calcularFechaTermino() {
  const fechaCreacion = this.agregarPrestamo.get('fechaCreacion')?.value;
  const plazoMeses = this.agregarPrestamo.get('plazoMeses')?.value;

  if (!fechaCreacion || !plazoMeses) {
    return;
  }

  
  const [day, month, year] = fechaCreacion.split('-');
  const fechaInicio = new Date(Number(year), Number(month) - 1, Number(day)); // Meses son base 0 en JS

  
  const fechaTermino = this.sumarMeses(fechaInicio, Number(plazoMeses));

  // Formatear la fecha de término a dd-mm-yyyy
  const dayEnd = String(fechaTermino.getDate()).padStart(2, '0');
  const monthEnd = String(fechaTermino.getMonth() + 1).padStart(2, '0'); // Meses base 0 en JS
  const yearEnd = fechaTermino.getFullYear();

  const fechaTerminoFormatted = `${dayEnd}-${monthEnd}-${yearEnd}`;

  // Actualizar el campo fechaTermino en el formulario
  this.agregarPrestamo.get('fechaTermino')?.setValue(fechaTerminoFormatted);
}

  
  obtenerPrestamos() {
    this.prestamoService.getList().subscribe({
      next: (data) => {
        this.listaPrestamos = data;
      },
      error: (e) => {
        console.error(e);
      }
    });
  }

  ngOnInit(): void {
    // Escuchar cambios en los campos montoPrestamo y plazoMeses
    this.agregarPrestamo.get('montoPrestamo')?.valueChanges.subscribe(() => {
      this.actualizarMontos();
    });

    this.agregarPrestamo.get('plazoMeses')?.valueChanges.subscribe(() => {
      this.actualizarMontos();
    });
    this.agregarPrestamo.get('plazoMeses')?.valueChanges.subscribe(() => {
      this.calcularFechaTermino();
    });
  
    this.agregarPrestamo.get('fechaCreacion')?.valueChanges.subscribe(() => {
      this.calcularFechaTermino();
    });

    this.changePasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }
  calcularPagoMensual(montoPrestamo: number, interesAnual: number, plazoMeses: number): number {
    const tasaMensual = interesAnual / 12 / 100; // Convertir tasa anual a mensual
    const pagoMensual = (montoPrestamo * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
  
    return pagoMensual;
  }
  // Método para calcular el monto total y deuda restante basado en el plazo y monto prestado
  actualizarMontos() {
    const montoPrestamo = this.agregarPrestamo.get('montoPrestamo')?.value;
    const plazoMeses = this.agregarPrestamo.get('plazoMeses')?.value;

    // Si no hay valores, no calculamos nada
    if (!montoPrestamo || !plazoMeses) {
      return;
    }

    // Calcular el interés aplicado basado en el plazo
    let interesAplicado = 0;
    if (plazoMeses <= 6) {
      interesAplicado = 10; // 10% si el plazo es menor o igual a 6 meses
    } else {
      interesAplicado = 20; // 20% si el plazo es mayor a 6 meses
    }
    const cuotaMensual = this.calcularPagoMensual(montoPrestamo, interesAplicado, plazoMeses);

    const totalIntereses = cuotaMensual * plazoMeses - montoPrestamo;

    // Calcular el monto total y la deuda restante
    const montoTotal = montoPrestamo + totalIntereses;
    const deudaRestante = montoTotal;

    // Actualizar los valores en el formulario
    this.agregarPrestamo.get('interesAplicado')?.setValue(interesAplicado);
    this.agregarPrestamo.get('montoTotal')?.setValue(montoTotal.toFixed(2)); // Formato con 2 decimales
    this.agregarPrestamo.get('deudaRestante')?.setValue(deudaRestante.toFixed(2)); // Inicialmente igual al monto total

    this.cuotaMensual = cuotaMensual.toFixed(2); // Cuota mensual
    this.totalIntereses = totalIntereses.toFixed(2); // Total de intereses
  }
  
  onLogin() {
    const { username, password } = this.loginForm.value;
    if (username === 'admin' && password === 'upao') {
      this.isLoggedIn = true;
      this.obtenerPrestamos(); // Obtener la lista de préstamos al iniciar sesión
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }

  agregaPrestamo() {
    if (this.agregarPrestamo.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }
    const plazoMeses = this.agregarPrestamo.get('plazoMeses')?.value;

  // Calcular la fecha de término
  const fechaCreacion = new Date(this.agregarPrestamo.get('fechaCreacion')?.value);
  const fechaTermino = new Date(fechaCreacion);
  fechaTermino.setMonth(fechaTermino.getMonth() + plazoMeses); // Sumar el plazo en meses
  
    const fechaTerminoFormatted = `${String(fechaTermino.getDate()).padStart(2, '0')}-${String(fechaTermino.getMonth() + 1).padStart(2, '0')}-${fechaTermino.getFullYear()}`;


    const request: Prestamo = {
      idPrestamo: 0, // Asumiendo que es un nuevo préstamo
      dniCliente: this.agregarPrestamo.get('dniCliente')?.value,
      nombreCliente: this.agregarPrestamo.get('nombreCliente')?.value,
      apellidoCliente: this.agregarPrestamo.get('apellidoCliente')?.value,
      direccionCliente: this.agregarPrestamo.get('direccionCliente')?.value,
      montoPrestamo: this.agregarPrestamo.get('montoPrestamo')?.value,
      interesAplicado: this.agregarPrestamo.get('interesAplicado')?.value,
      plazoMeses: this.agregarPrestamo.get('plazoMeses')?.value,
      montoTotal: this.agregarPrestamo.get('montoTotal')?.value,
      deudaRestante: this.agregarPrestamo.get('deudaRestante')?.value,
      estado: 'ACTIVO',
      fechaInicio: this.convertirAFormatoYYYYMMDD(this.agregarPrestamo.get('fechaCreacion')?.value), // Convertimos la fecha
      fechaFinal: fechaTerminoFormatted, // Convertimos la fecha
    };

    this.prestamoService.add(request).subscribe({
      next: (data) => {
        this.listaPrestamos.push(data);
        this.agregarPrestamo.reset({
          dniCliente: '',
        nombreCliente: '',
        apellidoCliente: '',
        direccionCliente: '',
        telefonoCliente: '',
        emailCliente: '',
        montoPrestamo: '',
        interesAplicado: '',
        plazoMeses: '',
        montoTotal: '',
        deudaRestante: '',
        estado: 'ACTIVO',
        fechaCreacion: this.obtenerFechaActualDDMMYYYY(), // Actualiza con la nueva fecha actual
        fechaTermino: ''
        }); // Limpiar el formulario después de agregar
      },
      error: (e) => {
        console.error('Error al agregar préstamo', e);
      }
    });
  }

  eliminarPrestamo(prestamo: Prestamo) {
    if (confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
      this.prestamoService.delete(prestamo.idPrestamo).subscribe({
        next: () => {
          this.listaPrestamos = this.listaPrestamos.filter(p => p.idPrestamo !== prestamo.idPrestamo);
          console.log('Préstamo eliminado con éxito');
        },
        error: (e) => {
          console.error('Error al eliminar el préstamo:', e);
        }
      });
    }
  }
   // Función para buscar el cliente en RENIEC usando el DNI
   /*buscarCliente(): void {
    if (this.dni.length === 8) {  // Verificar que el DNI tenga 8 caracteres
      this.prestamoService.validarDni(this.dni).subscribe({
        next: (response) => {
          if (response && response.existe) {
            this.cliente = response;  // Asignar cliente encontrado
            this.agregarPrestamo.patchValue({
              nombreCliente: response.nombres,
              apellidoCliente: `${response.apellido_paterno} ${response.apellido_materno}`
            });
            this.errorMessage = '';  // Limpiar mensaje de error
          } else {
            this.cliente = null;
            this.errorMessage = 'Cliente no encontrado o el DNI es incorrecto.';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Hubo un error al consultar el DNI en RENIEC.';
        }
      });
    } else {
      this.errorMessage = 'El DNI debe tener 8 caracteres.';
    }
  }*/
  validarDni() {
    if (this.validarDniFormato(this.dni)) {
    this.dniService.validarDniApi(this.dni).subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.resultado = data;
      },
      (error) => {
        // Aquí manejamos cualquier error que ocurra
        console.error('Error en la solicitud:', error);
      }
    );
  }
}
validarRuc() {
  if (this.validarRucFormato(this.ruc)) {
  this.rucService.validarRucApi(this.ruc).subscribe(
    (data) => {
      console.log('Datos recibidos:', data);
      this.resultadoruc = data;
    },
    (error) => {
      // Aquí manejamos cualquier error que ocurra
      console.error('Error en la solicitud:', error);
    }
  );
}
}
validarDniFormato(dni: string): boolean {
  // Verifica si el DNI tiene exactamente 8 dígitos y son todos números
  const dniPattern = /^\d{8}$/;
  return dniPattern.test(dni); // Devuelve true si el patrón es válido
}
validarRucFormato(ruc: string): boolean {
  // Verifica si el DNI tiene exactamente 8 dígitos y son todos números
  const rucPattern = /^\d{11}$/;
  return rucPattern.test(ruc); // Devuelve true si el patrón es válido
}
}

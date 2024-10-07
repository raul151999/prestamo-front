import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prestamo } from './Interfaces/Prestamo';
import { PrestamoService } from './Services/prestamo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule]
})
export class AppComponent implements OnInit {
  listaPrestamos: Prestamo[] = [];
  agregarPrestamo: FormGroup;
  loginForm: FormGroup;
  isLoggedIn = false; // Variable para controlar el estado de inicio de sesión
  title = 'AppPrestamos';
  

  constructor(
    private _PrestamoServicio: PrestamoService,
    private fb: FormBuilder
  ) {
    this.agregarPrestamo = this.fb.group({
      dniCliente: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      nombreCliente: ['', Validators.required],
      apellidoCliente: ['', Validators.required],
      direccionCliente: ['', Validators.required],
      telefonoCliente: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      emailCliente: ['', [Validators.required, Validators.email]],
      montoPrestamo: ['', [Validators.required, Validators.min(1)]],
      interesAplicado: [{ value: '', disabled: true }, Validators.required],
      plazoMeses: ['', [Validators.required, Validators.min(1)]],
      montoTotal: [{ value: '', disabled: true }, Validators.required],
      deudaRestante: [{ value: '', disabled: true }, Validators.required],
      estado: [{ value: 'ACTIVO', disabled: true }, Validators.required],
      fechaCreacion: [{ value: this.obtenerFechaActualDDMMYYYY(), disabled: true }, Validators.required],
      fechaTermino: [{ value: '', disabled: true }, Validators.required]
    });

    this.loginForm = this.fb.group({
      username: ['admin', Validators.required],
      password: ['upao', Validators.required]
    });
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
    this._PrestamoServicio.getList().subscribe({
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

    // Calcular el monto total y la deuda restante
    const montoTotal = montoPrestamo + (montoPrestamo * interesAplicado / 100);
    const deudaRestante = montoTotal;

    // Actualizar los valores en el formulario
    this.agregarPrestamo.get('interesAplicado')?.setValue(interesAplicado);
    this.agregarPrestamo.get('montoTotal')?.setValue(montoTotal.toFixed(2)); // Formato con 2 decimales
    this.agregarPrestamo.get('deudaRestante')?.setValue(deudaRestante.toFixed(2)); // Inicialmente igual al monto total
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
      telefonoCliente: this.agregarPrestamo.get('telefonoCliente')?.value,
      emailCliente: this.agregarPrestamo.get('emailCliente')?.value,
      montoPrestamo: this.agregarPrestamo.get('montoPrestamo')?.value,
      interesAplicado: this.agregarPrestamo.get('interesAplicado')?.value,
      plazoMeses: this.agregarPrestamo.get('plazoMeses')?.value,
      montoTotal: this.agregarPrestamo.get('montoTotal')?.value,
      deudaRestante: this.agregarPrestamo.get('deudaRestante')?.value,
      estado: 'ACTIVO',
      fechaCreacion: this.convertirAFormatoYYYYMMDD(this.agregarPrestamo.get('fechaCreacion')?.value), // Convertimos la fecha
      fechaTermino: fechaTerminoFormatted, // Convertimos la fecha
    };

    this._PrestamoServicio.add(request).subscribe({
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
      this._PrestamoServicio.delete(prestamo.idPrestamo).subscribe({
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
}

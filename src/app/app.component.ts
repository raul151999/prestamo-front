import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Prestamo } from './Interfaces/Prestamo';
import { PrestamoService } from './Services/prestamo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule]
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
      interesAplicado: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      plazoMeses: ['', [Validators.required, Validators.min(1)]],
      cuotas: ['', [Validators.required, Validators.min(1)]],
      montoTotal: ['', Validators.required],
      deudaRestante: ['', Validators.required],
      estado: ['', Validators.required],
      fechaCreacion: ['', Validators.required]
    });

    this.loginForm = this.fb.group({
      username: ['admin', Validators.required],
      password: ['upao', Validators.required]
    });
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
    // Verificar si el usuario ya ha iniciado sesión
    if (this.isLoggedIn) {
      this.obtenerPrestamos();
    }
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
    const request: Prestamo = {
      idPrestamo: 0, // Asumiendo que es un nuevo préstamo, se inicializa en 0.
      dniCliente: this.agregarPrestamo.value.dniCliente,
      nombreCliente: this.agregarPrestamo.value.nombreCliente,
      apellidoCliente: this.agregarPrestamo.value.apellidoCliente,
      direccionCliente: this.agregarPrestamo.value.direccionCliente,
      telefonoCliente: this.agregarPrestamo.value.telefonoCliente,
      emailCliente: this.agregarPrestamo.value.emailCliente,
      montoPrestamo: this.agregarPrestamo.value.montoPrestamo,
      interesAplicado: this.agregarPrestamo.value.interesAplicado,
      plazoMeses: this.agregarPrestamo.value.plazoMeses,
      cuotas: this.agregarPrestamo.value.cuotas,
      montoTotal: this.agregarPrestamo.value.montoTotal,
      deudaRestante: this.agregarPrestamo.value.deudaRestante,
      estado: this.agregarPrestamo.value.estado,
      fechaCreacion: this.agregarPrestamo.value.fechaCreacion
    };

    this._PrestamoServicio.add(request).subscribe({
      next: (data) => {
        this.listaPrestamos.push(data);
        this.agregarPrestamo.reset(); // Limpiar el formulario después de agregar
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

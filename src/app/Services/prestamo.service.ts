import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../config';
import { Observable } from 'rxjs';
import { Prestamo } from '../Interfaces/Prestamo';
@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  private apiUrl = 'https://www.apiprestamosupao.somee.com/api/Prestamos/';

  constructor(private http: HttpClient) {}

  // Obtiene la lista de préstamos
  getList(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}Lista`);
  }

  // Agrega un nuevo préstamo
  add(request: Prestamo): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.apiUrl}Agregar`, request);
  }

  // Elimina un préstamo por su ID
  delete(idPrestamo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}Eliminar/${idPrestamo}`);
  }

  // Obtiene un préstamo por su ID
  getById(idPrestamo: number): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.apiUrl}Obtener/${idPrestamo}`);
  }

  // Modifica un préstamo por su ID
  update(idPrestamo: number, request: Prestamo): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.apiUrl}Modificar/${idPrestamo}`, request);
  }
}


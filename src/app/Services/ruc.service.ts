import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RucService {
  private apiUrl = 'https://api.consultasperu.com/api/v1/query'; // URL de ejemplo para la consulta del RUC
  private token = '99c08f97a193c2ad8a8182da3b3802f72dae1568bf99667d2e9890d54d771b54';

  constructor(private http: HttpClient) { }

  validarRucApi(ruc: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    
    const body = {
      token: this.token,
      type_document: 'ruc',
      document_number: ruc // El DNI que ingresa el usuario
    };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}

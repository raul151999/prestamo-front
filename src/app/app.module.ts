// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // Importar ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule, // Asegúrate de que esto esté aquí
    HttpClientModule
  ],
  bootstrap: []
})
export class AppModule {}

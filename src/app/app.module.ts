// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importar ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { DniService } from './Services/dni.service';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule, // Asegúrate de que esto esté aquí
    HttpClientModule,
    FormsModule,
  ],
  providers: [DniService],
  bootstrap: [AppComponent]
})
export class AppModule {}

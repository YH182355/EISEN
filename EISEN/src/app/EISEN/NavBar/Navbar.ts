import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../BD/BD';

@Component({
  selector: 'Navbar',
  templateUrl: './Navbar.html',
  styleUrls: ['./Navbar.css']
})

export class NavbarComponent {

  @Input() Usuario = new Usuario();

  constructor(public router: ActivatedRoute, public router2:Router, public router3: Router) { 

    const state = this.router.snapshot?.root?.firstChild?.data?.state;
      if (state && state.Usuario){
        this.Usuario = state.Usuario.Nombre;
      }
      console.log(this.Usuario)  
      
  }

  ngOnInit(){

    
    if (this.router2.url === '/Proveedor') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('Prov');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/Productos') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('Prod');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/Inventario') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('Inv');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/Requisiciones') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('RC');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/NuevaRequisicion') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('NRQ');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/Entregas') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('ENT');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/Historial') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('Historial');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }
    if (this.router2.url === '/Ordenes') {
      // Obtener la etiqueta por su id
    const etiquetaInicio = document.getElementById('ORD');

    // Cambiar el nombre de clase
    if (etiquetaInicio) {
      etiquetaInicio.style.textDecoration = 'underline';
    }
    }

  }

  Logout(){
    this.router2.navigate(['/Login']);
    this.Usuario = new Usuario();
  }
    
  
}
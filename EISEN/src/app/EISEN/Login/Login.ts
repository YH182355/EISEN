import { Component,Input,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, where } from '@angular/fire/firestore';
import { collection, query, collectionData } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

import { Usuario } from '../BD/BD';

@Component({
  selector: 'Login',
  templateUrl: './Login.html',
  styleUrls: ['./Login.css']
 })

 export class LoginComponent {

  Usuario = new Usuario();


  constructor(private firstore: Firestore, public router:Router) {

  }

  Acceder(){
    const usuarios = collection(this.firstore, "Usuario");
    const Q = query(usuarios, where("User", "==", this.Usuario.User), where("Password", "==", this.Usuario.Password));
    if(this.Usuario.User.trim() !== '' || this.Usuario.Password.trim() !== ''){
    collectionData(Q).subscribe((ssUsuarios) => {
      if (ssUsuarios.length > 0) {
        this.Usuario.setData(ssUsuarios[0])
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Bienvenido ' + this.Usuario.Nombre,
          showConfirmButton: false,
          timer: 1500
        })
        this.router.navigate(['/Requisiciones'], {state: this.Usuario});
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Su contraseña es incorrecta',
        })
      }
    })
    }

    else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Olvidaste completar algunos campos!',
        footer: '<a href="">Why do I have this issue?</a>'
      })
    }

  }

  togglePassword() {
    // Obtener los elementos del DOM
    let password = document.getElementById("password") as HTMLInputElement;
    let eye = document.getElementById("eye") as HTMLImageElement;
    // Cambiar el tipo de input y la imagen según el estado actual
    if (password.type === "password") {
      password.type = "text";
      eye.src = "https://i.imgur.com/Ku6v1AF.png"; // imagen de ojo abierto
    } else {
      password.type = "password";
      eye.src = "https://i.imgur.com/tyTyBZg.png"; // imagen de ojo cerrado
    }
  }

  back(){
    let toggle = document.getElementById("toggle") as HTMLButtonElement;
    toggle.addEventListener("click", this.togglePassword);
  }


 }

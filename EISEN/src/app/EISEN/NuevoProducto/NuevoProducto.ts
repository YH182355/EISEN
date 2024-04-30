import { Component } from '@angular/core';
import { NuevoProducto, Usuario } from '../BD/BD';
import { doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Router } from '@angular/router';
import { Firestore, where, updateDoc } from '@angular/fire/firestore';
import { collection, query, collectionData } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'NuevoProducto',
  templateUrl: './NuevoProducto.html',
  styleUrls: ['./NuevoProducto.css']
})

export class NuevoProductoComponent {

  Cosa: NuevoProducto = new NuevoProducto();
  Usuario = new Usuario();


  constructor(private firestore: Firestore, private router: Router) {
    if (history.state.IdUsuario == "" || history.state.IdUsuario == undefined) {
    } else {
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);
  }

  Crear() {
    if (!this.Cosa.Nombre || !this.Cosa.Unidad || !this.Cosa.FechaGeneracion || !this.Cosa.CantidadNecesaria || !this.Cosa.Descripcion || !this.Cosa.Precio || !this.Cosa.Marca || !this.Cosa.Categoria || !this.Cosa.Motivo) {
      Swal.fire({
        position: 'top',
        icon: 'warning',
        title: 'Completa todos los campos',
        showConfirmButton: false,
        timer: 1200
      });
      return;
    };
    this.Cosa.IdNuevoProducto = "ID-" + this.generateRandomString(10);
    let si = doc(this.firestore, "NuevoProducto", this.Cosa.IdNuevoProducto)
    setDoc(si, JSON.parse(JSON.stringify(this.Cosa))).then(() => {
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Nuevo Producto Añadido',
        showConfirmButton: true,
        timer: 1200
      });
      location.reload();

    });
  }


  generateRandomString = (num: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = '';
    const charactersLenght = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLenght));
    }
    return result1;
  }



}
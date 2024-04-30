import { Component, OnInit } from "@angular/core";
import { Firestore, collection, query, where, getDocs,updateDoc, collectionData } from '@angular/fire/firestore';
import { Proveedor, Usuario } from "../BD/BD";
import { doc, setDoc,deleteDoc, limit, orderBy } from 'firebase/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
    selector: 'Proveedor',
    templateUrl: './Proveedor.html',
    styleUrls: ['./Proveedor.css']
  })

export class ProveedorComponent{

  Usuario = new Usuario();
  Proveedorr: Proveedor[] = new Array();
  EditarProvedor: Proveedor[] = new Array();
  NuevoProveedor: Proveedor = new Proveedor();

//#region Variables
  Buscar:string='';
  CategoriaOpcion:string='Metodo';

//#endregion

  constructor(private firestore: Firestore, public router:Router,){
   
    if(history.state.IdUsuario == "" || history.state.IdUsuario == undefined){
      
    }
    else{
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);
  }

  ngOnInit() {
    this.TodosProveedores();
    const modalEstado = localStorage.getItem('modalEstado');
    if (modalEstado == 'cerrado') {
      this.cerrarModal();
    }
    const modalEstado2 = localStorage.getItem('modalEstado2');
    if (modalEstado2 == 'cerrado') {
      this.cerrarModal2();
    }
  }

  //#region Modaaaaal
  abrirModal() {
    const modal = document.getElementById('myModal') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'block';
      localStorage.setItem('modalEstado', 'abierto');
    }
  }

  cerrarModal() {
    const modal = document.getElementById('myModal') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'none';
      localStorage.setItem('modalEstado', 'cerrado');
    }
  }
  abrirModal2() {
    const modal = document.getElementById('myModal2') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'block';
      localStorage.setItem('modalEstado', 'abierto');
    }
  }

  cerrarModal2() {
    const modal = document.getElementById('myModal2') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'none';
      localStorage.setItem('modalEstado', 'cerrado');
    }
  }
  //#endregion

  //#region Tablaa
  TodosProveedores(){
    const E = collection(this.firestore, "Proveedor");
    //acomoda alfabeticamente con el orderBy
    const C = query(E, orderBy("Nombre"));
    collectionData(C).subscribe((ssProveedores) => {
      this.Proveedorr = new Array();
      if (ssProveedores.length > 0) {
        ssProveedores.forEach((item:any) => {
          let Proveedorx = new Proveedor;
          Proveedorx.setData(item);
          this.Proveedorr.push(Proveedorx);
        })
      }
    })
    }

    VaciarFiltros(){
      this.TodosProveedores();
      this.CategoriaOpcion = "Metodo"
    }

    ProveedorCategoria(event: Event){
      console.log(event);
      const categoriaa = (event.target as HTMLSelectElement).value;
      const I = collection(this.firestore, "Proveedor");
      const C = query(I, where("MetodoPago", "==", categoriaa), orderBy("Nombre"));
      collectionData(C).subscribe((ssProveedorCategoria) => {
        this.Proveedorr = new Array();
        if (ssProveedorCategoria.length > 0) {
          ssProveedorCategoria.forEach((item:any) => {
            let Proveedorx = new Proveedor;
            Proveedorx.setData(item);
            this.Proveedorr.push(Proveedorx);
          })
        }
      })
      }

      Buscador(){
      const I = collection(this.firestore, "Proveedor");
      const C = query(I, where("Nombre", "<=", this.Buscar + '\uf8ff'), where("Nombre", ">=", this.Buscar));
      collectionData(C).subscribe((ssProveedorBuscador) => {
        this.Proveedorr = new Array();
        if (ssProveedorBuscador.length > 0) {
          ssProveedorBuscador.forEach((item:any) => {
            let Proveedorx = new Proveedor;
            Proveedorx.setData(item);
            this.Proveedorr.push(Proveedorx);
          })
        }
      })
        console.log(this.Buscar);
        this.Buscar = '';
      }
  
  //#endregion

  EditarDatoss(ProveedorE: Proveedor){
    this.abrirModal();
    console.log(ProveedorE)
    const PE = collection(this.firestore, "Proveedor");
      const F = query(PE, where("IdProveedor", "==", ProveedorE.IdProveedor));
      collectionData(F).subscribe((ssProveedorEditar) => {
        this.EditarProvedor = new Array();
        if (ssProveedorEditar.length > 0) {
          ssProveedorEditar.forEach((item:any) => {
            let ProveedorE = new Proveedor;
            ProveedorE.setData(item);
            this.EditarProvedor.push(ProveedorE);
            console.log(this.EditarProvedor)
          })
        }
      })

  }

  GuardarCambios(Provedorrr: Proveedor){
    console.log(Provedorrr);
    const a = doc(this.firestore, 'Proveedor', Provedorrr.IdProveedor);
    updateDoc(a, { 
      Nombre: Provedorrr.Nombre,
      RazonSocial: Provedorrr.RazonSocial,
      CLABE: Provedorrr.CLABE,
      RFC: Provedorrr.RFC,
      MetodoPago: Provedorrr.MetodoPago,
      Telefono: Provedorrr.Telefono,
      Direccion: Provedorrr.Telefono
    });
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Cambios guardardados',
      showConfirmButton: false,
      timer: 1500
    })
    this.TodosProveedores();
    this.cerrarModal();
  }

  async borrar(x: Proveedor) {
    console.log(x);
    const index = this.Proveedorr.indexOf(x);
    console.log(index);

    if (index >= 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: '¿Quieres borrar a este Proveedor?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
        const docRef = doc(this.firestore, 'Proveedor', x.IdProveedor);
        await deleteDoc(docRef);
        this.Proveedorr.splice(index, 0);
      }
    }
  }

  NuevoProveedorrrr(){
    this.NuevoProveedor.IdProveedor = "ID-" + this.generateRandomString(10);

    let si = doc(this.firestore, "Proveedor", this.NuevoProveedor.IdProveedor);
    setDoc(si, JSON.parse(JSON.stringify(this.NuevoProveedor))).then(() => {
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Proveedor agendado',
        showConfirmButton: true,
        timer: 1200
      });
      this.NuevoProveedor = new Proveedor();
      this.cerrarModal2();
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
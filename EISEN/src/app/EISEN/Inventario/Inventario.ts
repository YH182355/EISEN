import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, where } from '@angular/fire/firestore';
import { collection, query, collectionData } from '@angular/fire/firestore';
import { Inventario, Usuario, Producto, Proveedor, Entrega } from '../BD/BD';
import Swal from 'sweetalert2';
import { doc, setDoc, deleteDoc, getDocs, updateDoc, orderBy, limit } from 'firebase/firestore';
import { saveAs } from 'file-saver';



@Component({
  selector: 'Inventario',
  templateUrl: './Inventario.html',
  styleUrls: ['./Inventario.css']
})

export class InventarioComponent {

  Usuario = new Usuario();
  Inventarioo: Inventario[] = new Array();
  DetallesModal: Inventario[] = [];
  DetallesProductoz: Producto[] = new Array();
  DetallesProveedorr: Proveedor[] = new Array();

  CheckBoxValor: boolean = true;
  Recogido: Entrega = new Entrega();
  Material: Inventario[] = new Array();
  Elden: Inventario = new Inventario()
  Empresas: Inventario[] = [];

  //#region Variables
  Buscar: string = '';
  CategoriaOpcion: string = 'Categoria';
  fechaActual: string;

  //#endregion


  ngOnInit() {
    this.TodoInventario();
    this.CargarEn();
    const modalEstado = localStorage.getItem('modalEstado');
    const modalEstado2 = localStorage.getItem('modalEstado2');
    if (modalEstado == 'cerrado' || modalEstado2 == 'cerrado') {
      this.cerrarModal();
      this.cerrarModal2();
    }
  }

  constructor(private firestore: Firestore, public router: Router,) {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.fechaActual = `${year}-${month}-${day}`;
    this.Recogido.Fecha = this.fechaActual;

    if (history.state.IdUsuario == "" || history.state.IdUsuario == undefined) {

    }
    else {
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);
    this.Recogido.Responsable = this.Usuario.Nombre;

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
    const modal2 = document.getElementById('myModal2') as HTMLElement | null;
    if (modal2) {
      modal2.style.display = 'block';
      localStorage.setItem('modalEstado2', 'abierto');
    }
    this.Recogido.Recibe = '';
    this.Recogido.Cantidad = 0;
    this.Recogido.FechaEntrega = '';
  }

  cerrarModal2() {
    const modal2 = document.getElementById('myModal2') as HTMLElement | null;
    if (modal2) {
      modal2.style.display = 'none';
      localStorage.setItem('modalEstado2', 'cerrado');
    }
  }
  //#endregion


  TodoInventario() {
    const E = collection(this.firestore, "Inventario");
    const C = query(E, where("Cantidad", ">", 0));
    collectionData(C).subscribe((ssInventario) => {
      this.Inventarioo = new Array();
      if (ssInventario.length > 0) {
        ssInventario.forEach((item: any) => {
          let Inventariox = new Inventario;
          Inventariox.setData(item);
          this.Inventarioo.push(Inventariox);
        })
      }
    })
  }

  VaciarFiltros() {
    this.TodoInventario();
    this.CategoriaOpcion = "Categoria"
  }

  InventarioCategoria(event: Event) {
    console.log(event);
    const categoriaa = (event.target as HTMLSelectElement).value;
    const I = collection(this.firestore, "Inventario");
    const C = query(I, where("Categoria", "==", categoriaa));
    collectionData(C).subscribe((ssInventarioCategoria) => {
      this.Inventarioo = new Array();
      if (ssInventarioCategoria.length > 0) {
        ssInventarioCategoria.forEach((item: any) => {
          let Inventariox = new Inventario;
          Inventariox.setData(item);
          this.Inventarioo.push(Inventariox);
        })
      }
    })
  }

  Buscador() {
    const I = collection(this.firestore, "Inventario");
    const C = query(I, where("Nombre", "<=", this.Buscar + '\uf8ff'), where("Nombre", ">=", this.Buscar));
    collectionData(C).subscribe((ssInventarioBuscador) => {
      this.Inventarioo = new Array();
      if (ssInventarioBuscador.length > 0) {
        ssInventarioBuscador.forEach((item: any) => {
          let Inventariox = new Inventario;
          Inventariox.setData(item);
          this.Inventarioo.push(Inventariox);
        })
      }
    })
    console.log(this.Buscar);
    this.Buscar = '';
  }

  //#region Detalles

  DetallesInventario(InventarioDetalles: Inventario) {
    this.abrirModal();
    console.log(InventarioDetalles)
    const PE = collection(this.firestore, "Inventario");
    const E = query(PE, where("IdInventario", "==", InventarioDetalles.IdInventario));
    collectionData(E).subscribe((ssInventario) => {
      this.DetallesModal = new Array();
      if (ssInventario.length > 0) {
        ssInventario.forEach((item: any) => {
          let InventarioDetalles = new Inventario;
          InventarioDetalles.setData(item);
          this.DetallesModal.push(InventarioDetalles);

          const idProducto = InventarioDetalles.IdProducto;
          this.DetallesProducto(idProducto);
        })
      }
    })
  }

  DetallesProducto(idProducto: string) {
    this.abrirModal();
    const PE = collection(this.firestore, "Producto");
    const E = query(PE, where("IdProducto", "==", idProducto));
    collectionData(E).subscribe((ssProducto) => {
      this.DetallesProductoz = new Array();
      if (ssProducto.length > 0) {
        ssProducto.forEach((item: any) => {
          let ProductoDetalles = new Producto;
          ProductoDetalles.setData(item);
          this.DetallesProductoz.push(ProductoDetalles);

          const idProveedor = ProductoDetalles.IdProveedor;
          // this.DetallesProveedor(idProveedor);
        })
      }
    })

  }
  //#endregion

  ModalEntrega(InventarioDetalles: Inventario) {
    this.abrirModal2();
    console.log(InventarioDetalles)
    const PE = collection(this.firestore, "Inventario");
    const E = query(PE, where("IdInventario", "==", InventarioDetalles.IdInventario));
    collectionData(E).subscribe((ssInventario) => {
      this.Material = new Array();
      if (ssInventario.length > 0) {
        ssInventario.forEach((item: any) => {
          let InventarioDetalles = new Inventario;
          InventarioDetalles.setData(item);
          this.Material.push(InventarioDetalles);
          console.log(this.Material)
        })
      }
    })
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

  async CargarEn() {
    const R = collection(this.firestore, "Inventario");
    const querySnapshot = await getDocs(R);
    this.Material = querySnapshot.docs.map((doc) => doc.data() as Inventario);

  }

  Abrir(cosa: Inventario) {
    this.Elden = JSON.parse(JSON.stringify(cosa))
  }

  Entregar() {
    if (this.Recogido.Cantidad === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Agregar Cantidad',
        text: 'Debe agregar la cantidad de productos que se desean entregar.',
      });
    }


    if (!this.Recogido.Recibe || !this.Recogido.FechaEntrega) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Los campos "Recibe" y "Fecha de Entrega" deben llenarse.',
      });
    }


    if (
      !this.Recogido.Responsable ||
      !this.Recogido.Recibe ||
      !this.Recogido.Fecha ||
      !this.Recogido.FechaEntrega ||
      !this.Recogido.Cantidad
    ) {
      return;
    }
    this.Recogido.IdEntrega = "ID-" + this.generateRandomString(10);
    this.Recogido.Producto = this.Elden;
    let FechaBase = new Date(this.Recogido.FechaEntrega);
    this.Recogido.FechaEntregaValor = FechaBase.getTime();

    // si el checkbox esta chequeado significa que sigue en el inventario y si no esta chequeado es porque se restara del Inventario.
    if (this.CheckBoxValor === false) {
      this.RestarCantidadInventario(this.Recogido.Producto.IdInventario, this.Recogido.Cantidad);
      this.CheckBoxValor = true;
    }


    // this.RestarCantidadInventario(this.Recogido.Producto.IdInventario, this.Recogido.Cantidad);

    let si = doc(this.firestore, "Entrega", this.Recogido.IdEntrega);
    setDoc(si, JSON.parse(JSON.stringify(this.Recogido))).then(() => {
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Entrega Confirmada',
        showConfirmButton: true,
        timer: 1200
      });
      location.reload();
      this.cerrarModal2();
    });
  }



  //#region Pruebaaaaaa
  RestarCantidadInventario(IdProducto: string, cantidad: number) {

    const productoEnInventario = this.Inventarioo.find((producto) => producto.IdInventario === IdProducto);

    if (productoEnInventario) {
      productoEnInventario.Cantidad -= cantidad;

      console.log(productoEnInventario)
      const docRef = doc(this.firestore, 'Inventario', productoEnInventario.IdInventario);
      setDoc(docRef, JSON.parse(JSON.stringify(productoEnInventario))).then(() => {

      });
    }
  }

  PruebaExcel() {
    const E = collection(this.firestore, "Inventario");
    const C = query(E, where("Cantidad", ">", 0));
    collectionData(C).subscribe((ssInventario) => {
      this.Inventarioo = new Array();
      if (ssInventario.length > 0) {
        ssInventario.forEach((item: any) => {
          let Inventariox = new Inventario;
          Inventariox.setData(item);
          this.Inventarioo.push(Inventariox);
        })
      }
    })
    
    // Agregar encabezados a cada columna
    const headers = Object.keys(this.Inventarioo[0]).slice(2); // Omitir las dos primeras columnas
    const csvData = this.convertToCSV(this.Inventarioo, headers);

    // Crear un blob con los datos CSV
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });

    // Guardar el archivo
    saveAs(blob, 'Inventario.csv');
  }

  private convertToCSV(objArray: any[], headers: string[]): string {
    let str = '';

    // Agregar encabezados
    str += headers.join(',') + '\r\n';

    // Agregar datos
    for (let i = 0; i < objArray.length; i++) {
      let line = '';
      const values = Object.values(objArray[i]).slice(2); // Omitir las dos primeras columnas
      for (const value of values) {
        if (line !== '') line += ',';
        line += value;
      }
      str += line + '\r\n';
    }

    return str;
  }

  //#endregion
}
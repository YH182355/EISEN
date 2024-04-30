import { Component, Input, OnInit } from '@angular/core';
import { RequisicionCompra, Usuario, ProductosRequisicion } from '../BD/BD';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData } from '@angular/fire/firestore';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'Pagos',
  templateUrl: './Pagos.html',
  styleUrls: ['./Pagos.css']
})

export class PagosComponent {

  Usuario = new Usuario();
  req = new RequisicionCompra();
  RequisicionCompra = new RequisicionCompra()
  @ViewChild('xCosa') xCosaTextarea!: ElementRef;


  Comprobantes: any[] = new Array();
  Cotizaciones: any[] = new Array();

  constructor(private firestore: Firestore, public router: Router, public storage: Storage) {
    if (history.state[0] == "" || history.state[0] == undefined) {

    }
    else {
      localStorage.setItem('User', JSON.stringify(history.state[0]));
      localStorage.setItem('RequisicionCompra', JSON.stringify(history.state[1]));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);

    this.req = JSON.parse(localStorage.getItem('RequisicionCompra')!);
    console.log(this.req)
  }


  ngOnInit() {
    const modalEstado = localStorage.getItem('modalEstado');
    if (modalEstado == 'cerrado') {
      this.cerrarModal();
    }
    this.ProductosDeLaRequisicion();

  }

  //#region Modaaaaaaal
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
  //#endregion

  ProductosDeLaRequisicion() {
    const X = collection(this.firestore, "RequisicionCompra");
    const Y = query(X, where("IdRequisicionCompra", "==", this.req.IdRequisicionCompra));
    collectionData(Y).subscribe((ssProductosparaRequisicion) => {
      if (ssProductosparaRequisicion.length > 0) {
        this.RequisicionCompra.setData(ssProductosparaRequisicion[0])
        this.RequisicionCompra.ProductosParaRequisicion = this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== 'Pendiente' && producto.Estatus !== 'No Aceptado');

      }
    });
  }

  GuardarPagos(Actualizados: RequisicionCompra) {
    // this.ArchivarComprobante(Actualizados);
    const requisicionDocRef = doc(this.firestore, 'RequisicionCompra', Actualizados.IdRequisicionCompra);

    
    if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "Pagado").length == 0) {
      this.RequisicionCompra.Estatus = "Comprada"
    } else { this.RequisicionCompra.Estatus = "Revisado" }
    console.log(this.RequisicionCompra.Estatus)

    // Actualiza el documento de la Requisición de Compra con el nuevo array de productos
    setDoc(requisicionDocRef, JSON.parse(JSON.stringify(this.RequisicionCompra))).then(() => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Datos guardados correctamente',
        timer: 1200
      });
      this.cerrarModal();
      // this.router.navigate(['/Requisiciones'], { state: this.Usuario });
    });
  }

  //#region Comprobantesss
  // ArchivarComprobante(Cosa: RequisicionCompra) {
  //   let rutaDoc = doc(this.firestore, "RequisicionCompra", Cosa.IdRequisicionCompra);
  //   let Comprobante = <HTMLInputElement>document.getElementById("file");
  //   if (Comprobante.files?.length! > 0) {
  //     let ruta = Cosa.IdRequisicionCompra + "_" + Comprobante.files![0].name
  //     const archivos = ref(this.storage, ruta);
  //     uploadBytesResumable(archivos, Comprobante.files![0]).then(() => {
  //       Cosa.Comprobante.push(ruta)
  //       let data = { Comprobante: Cosa.Comprobante }
  //       updateDoc(rutaDoc, data)
  //     })
  //     this.Comprobantes = new Array();
  //     console.log(this.Comprobantes)
  //   }
  // }

  // MostrarArchivos(archivo: any) {
  //   console.log(archivo);
  //   const doc: FileList = archivo.target.files;
  
  //   for (let i = 0; i < doc.length; i++) {
  //     const archivo = doc[i];
  //     this.Comprobantes.push(archivo);
  //   }
  // }
  
  // CargarArchivos(archivo: any) {
  //   console.log(archivo);
  //   const doc: FileList = archivo.target.files;
  
  //   for (let i = 0; i < doc.length; i++) {
  //     const archivo = doc[i];
  //     this.Comprobantes.push(archivo);
  //   }
  // }

  // DescargarArchivo(rutaArchivo: string) {
  //   const archivoRef = ref(this.storage, rutaArchivo);
  
  //   getDownloadURL(archivoRef)
  //     .then((url) => {
  //       // Abre una nueva ventana o pestaña del navegador con la URL del archivo
  //       window.open(url);
  //     })
  //     .catch((error) => {
  //       console.error('Error al descargar el archivo:', error);
  //       // Manejar el error según sea necesario
  //     });
  // }
  //#endregion

  //#region Comentariooooss
  comentario(com: string) {
    let Fecha = new Date();
    let date = Fecha.getDate() + '-' + (Fecha.getMonth() + 1) + '-' + Fecha.getFullYear() + ' ' + Fecha.getHours() + ':' + Fecha.getMinutes()
    this.RequisicionCompra.Comentarios.push({
      User: this.Usuario.Nombre,
      Comentario: com,
      Fecha: date,
      Estatus: this.RequisicionCompra.Estatus
    })
    if (this.xCosaTextarea) {
      this.xCosaTextarea.nativeElement.value = '';
    }

  }
  //#endregion
  
}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { RequisicionCompra, Usuario, ProductosRequisicion, Producto, Proveedor, Cotizacion, Inventario, OrdendeCompra } from '../BD/BD';

@Component({
  selector: 'Orden-compra',
  templateUrl: './OrdenCompra.html',
  styleUrls: ['./OrdenCompra.css']
})
export class OrdenCompraComponent implements OnInit {


  ord = new OrdendeCompra();
  Usuario = new Usuario();
  ProductosOrden: ProductosRequisicion[] = new Array();
  VerDetallesProducto: ProductosRequisicion[] = new Array();
  OrdendeCompra = new OrdendeCompra()
  @ViewChild('xCosa') xCosaTextarea!: ElementRef;



  //#region Variablesss
  Solicitante: string = ""
  Responsable: string = ""
  Selector: string = ""
  FechaReq: string = ""
  CostoTotal: number = 0;
  habilitar: boolean = false;
  Comprobantes: any[] = new Array();
  Cotizaciones: any[] = new Array();
  //#endregion


  constructor(private firestore: Firestore, public router: Router, public storage: Storage) {
    if (history.state[0] == "" || history.state[0] == undefined) {

    }
    else {
      localStorage.setItem('User', JSON.stringify(history.state[0]));
      localStorage.setItem('OrdendeCompra', JSON.stringify(history.state[1]));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);


    this.ord = JSON.parse(localStorage.getItem('OrdendeCompra')!);
    console.log(this.ord)

  }


  ngOnInit() {
    const modalEstado = localStorage.getItem('modalEstado');
    if (modalEstado == 'cerrado') {
      this.cerrarModal();
    }

    this.ProductosDeLaOrden();
  }

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

  ProductosDeLaOrden() {
    const X = collection(this.firestore, "OrdendeCompra");
    const Y = query(X, where("IdOrdendeCompra", "==", this.ord.IdOrdendeCompra));
    collectionData(Y).subscribe((ssProductosparaOrden) => {
      if (ssProductosparaOrden.length > 0) {
        this.OrdendeCompra.setData(ssProductosparaOrden[0]);
      }
    });
  }

  ModalEditarDatos(ProductosE: ProductosRequisicion) {
    this.abrirModal();
    const PE = collection(this.firestore, "Producto");
    const E = query(PE, where("IdProducto", "==", ProductosE.IdProducto));
    collectionData(E).subscribe((ssProductoEditar) => {
      this.VerDetallesProducto = new Array();
      if (ssProductoEditar.length > 0) {
        ssProductoEditar.forEach((item: any) => {
          let ProductoE = new Producto;
          ProductoE.setData(item);
          this.VerDetallesProducto.push(ProductosE);
        });
      }
    });
  }

  GuardarOrden(Actualizados: OrdendeCompra, alert: boolean) {
    this.ArchivarComprobante(Actualizados);
    let OrdenCompraDocRef = doc(this.firestore, 'OrdendeCompra', Actualizados.IdOrdendeCompra);
    setDoc(OrdenCompraDocRef, JSON.parse(JSON.stringify(this.OrdendeCompra))).then(() => {
      if (alert) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Datos guardados correctamente',
          timer: 1200
        });
      }
      this.router.navigate(['/Ordenes'], { state: this.Usuario });
    });
  }

  PagarOrden(Actualizados: OrdendeCompra, alert: boolean) {
    Actualizados.Estatus = "Pagada";
    let OrdenCompraActDocRef = doc(this.firestore, 'OrdendeCompra', Actualizados.IdOrdendeCompra);
    setDoc(OrdenCompraActDocRef, JSON.parse(JSON.stringify(this.OrdendeCompra))).then(() => {
      if (alert) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Orden Pagada con exito',
          timer: 1200
        });
      }
      this.router.navigate(['/Ordenes'], { state: this.Usuario });
    });
  }



  verificarFormaDePago(): boolean {
    if (this.OrdendeCompra.ProductosParaRequisicion.length > 0) {
      const primerProducto = this.OrdendeCompra.ProductosParaRequisicion[0];
      const formaDePago = primerProducto.MetodoPago;
      const estatusOrden = this.OrdendeCompra.Estatus;
  
      return formaDePago === 'TDC Corporativa' || estatusOrden === 'Generada';
    }
    return false;
  }
  

  comentario(com: string) {
    let Fecha = new Date();
    let date = Fecha.getDate() + '-' + (Fecha.getMonth() + 1) + '-' + Fecha.getFullYear() + ' ' + Fecha.getHours() + ':' + Fecha.getMinutes();
    this.OrdendeCompra.Comentarios.push({
      User: this.Usuario.Nombre,
      Comentario: com,
      Fecha: date,
      Estatus: this.OrdendeCompra.Estatus
    });
    if (this.xCosaTextarea) {
      this.xCosaTextarea.nativeElement.value = '';
    }
  }

  ArchivarComprobante(Cosa: OrdendeCompra) {
    let rutaDoc = doc(this.firestore, "OrdendeCompra", Cosa.IdOrdendeCompra);
    let Cotizaciones = <HTMLInputElement>document.getElementById("file");
    if (Cotizaciones.files?.length! > 0) {
      let ruta = Cosa.IdOrdendeCompra + "_" + Cotizaciones.files![0].name;
      const archivos = ref(this.storage, ruta);
      uploadBytesResumable(archivos, Cotizaciones.files![0]).then(() => {
        Cosa.Cotizacion.push(ruta);
        let data = { Cotizacion: Cosa.Cotizacion };
        updateDoc(rutaDoc, data);
      });
      this.Cotizaciones = new Array();
    }
  }

  MostrarArchivos(archivo: any) {
    const doc: FileList = archivo.target.files;
    for (let i = 0; i < doc.length; i++) {
      const archivo = doc[i];
      this.Cotizaciones.push(archivo);
    }
  }

  CargarArchivos(archivo: any) {
    const doc: FileList = archivo.target.files;
    for (let i = 0; i < doc.length; i++) {
      const archivo = doc[i];
      this.Cotizaciones.push(archivo);
    }
  }

  DescargarArchivo(rutaArchivo: string) {
    const archivoRef = ref(this.storage, rutaArchivo);
  
    getDownloadURL(archivoRef)
      .then((url) => {
        // Abre una nueva ventana o pestaña del navegador con la URL del archivo
        window.open(url);
      })
      .catch((error) => {
        console.error('Error al descargar el archivo:', error);
        // Manejar el error según sea necesario
      });
  }



}

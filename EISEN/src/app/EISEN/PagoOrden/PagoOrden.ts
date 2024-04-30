import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { RequisicionCompra, Usuario, ProductosRequisicion, Producto, Proveedor, Cotizacion, Inventario, OrdendeCompra } from '../BD/BD';

@Component({
  selector: 'PagoOrden',
  templateUrl: './PagoOrden.html',
  styleUrls: ['./PagoOrden.css']
})
export class PagoOrdenComponent implements OnInit {


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


  // VerDetallesProducto: ProductosRequisicion[] = [];
 
  
  detalleprov: Proveedor[] = new Array();
  

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

  //#region Modal
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


  ProductosDeLaOrden() {
    const X = collection(this.firestore,"OrdendeCompra");
    const Y = query(X, where("IdOrdendeCompra", "==", this.ord.IdOrdendeCompra));
    collectionData(Y).subscribe((ssProductosparaOrden) => {
      if (ssProductosparaOrden.length > 0) {
        this.OrdendeCompra.setData(ssProductosparaOrden[0])
        console.log(this.OrdendeCompra)
      }
    });
  }



  ModalEditarDatos(producto: ProductosRequisicion) {
    this.abrirModal();
  
    const productoRef = doc(this.firestore, 'Producto', producto.IdProducto);
    getDoc(productoRef).then((productoSnapshot) => {
      if (productoSnapshot.exists()) {
        const productoData = productoSnapshot.data();
        this.VerDetallesProducto = []; // Limpiar antes de agregar el nuevo producto
        let productoDetalle = new ProductosRequisicion(); 
        productoDetalle.setData(productoData);
        this.VerDetallesProducto.push(productoDetalle);
        console.log(this.VerDetallesProducto);
      }
    });
  
    // Consulta para obtener datos del proveedor 
    const proveedorRef = doc(this.firestore, 'Proveedor', producto.IdProveedor);
    getDoc(proveedorRef).then((proveedorSnapshot) => {
      if (proveedorSnapshot.exists()) {
        const proveedorData = proveedorSnapshot.data();
        this.detalleprov = []; 
        let proveedor = new Proveedor();
        proveedor.setData(proveedorData);
        this.detalleprov.push(proveedor);
        console.log(this.detalleprov);
      }
    });
  }
  
  

  GuardarOrden(Actualizados: OrdendeCompra, alert: boolean) {
    this.ArchivarComprobante(Actualizados);
    let OrdenCompraDocRef = doc(this.firestore, 'OrdendeCompra', Actualizados.IdOrdendeCompra);
    // Actualiza el documento de la Orden de Compra con el nuevo array de productos
    setDoc(OrdenCompraDocRef, JSON.parse(JSON.stringify(this.OrdendeCompra))).then(() => {
      if(alert){
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
  
      return formaDePago === 'Transferencia' || estatusOrden === 'Generada';
    }
    return false;
  }
  
  
  


  //#region Comentariooooss

  comentario(com: string) {
    let Fecha = new Date();
    let date = Fecha.getDate() + '-' + (Fecha.getMonth() + 1) + '-' + Fecha.getFullYear() + ' ' + Fecha.getHours() + ':' + Fecha.getMinutes()
    this.OrdendeCompra.Comentarios.push({
      User: this.Usuario.Nombre,
      Comentario: com,
      Fecha: date,
      Estatus: this.OrdendeCompra.Estatus
    })
    if (this.xCosaTextarea) {
      this.xCosaTextarea.nativeElement.value = '';
    }
  }
  //#endregion



  ArchivarComprobante(Cosa: OrdendeCompra) {
    let rutaDoc = doc(this.firestore, "OrdendeCompra", Cosa.IdOrdendeCompra);
    let Comprobante = <HTMLInputElement>document.getElementById("file");
    if (Comprobante.files?.length! > 0) {
      let ruta = Cosa.IdOrdendeCompra + "_" + Comprobante.files![0].name
      const archivos = ref(this.storage, ruta);
      uploadBytesResumable(archivos, Comprobante.files![0]).then(() => {
        Cosa.Comprobante.push(ruta)
        let data = { Comprobante: Cosa.Comprobante }
        updateDoc(rutaDoc, data)
      })
      this.Comprobantes = new Array();
      console.log(this.Comprobantes)
    }
  }

  MostrarArchivos(archivo: any) {
    console.log(archivo);
    const doc: FileList = archivo.target.files;
  
    for (let i = 0; i < doc.length; i++) {
      const archivo = doc[i];
      this.Comprobantes.push(archivo);
    }
  }
  
  CargarArchivos(archivo: any) {
    console.log(archivo);
    const doc: FileList = archivo.target.files;
  
    for (let i = 0; i < doc.length; i++) {
      const archivo = doc[i];
      this.Comprobantes.push(archivo);
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

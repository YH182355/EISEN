import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { RequisicionCompra, Usuario, ProductosRequisicion, Producto, Proveedor, Cotizacion, Inventario, OrdendeCompra } from '../BD/BD';

@Component({
  selector: 'Requisicion-compra',
  templateUrl: './Requisicion-compra.html',
  styleUrls: ['./Requisicion-compra.css']
})
export class RequisicioncompraComponent implements OnInit {

  req = new RequisicionCompra();
  OrdenCompra = new OrdendeCompra();
  cot = new Cotizacion();
  Proveedor: Proveedor[] = new Array();
  NuevoProducto: Producto = new Producto();
  Productos: Producto[] = new Array()
  Requisicion: RequisicionCompra = new RequisicionCompra();
  selectedProductosforOrden: ProductosRequisicion[] = [];

  Usuario = new Usuario();

  VerProductosRequisicion: ProductosRequisicion[] = new Array();
  RequisicionCompra = new RequisicionCompra();
  productoModal = new ProductosRequisicion();
  preProductosReq: ProductosRequisicion[] = new Array();

  CostoTotal: number = 0;

  @ViewChild('xCosa') xCosaTextarea!: ElementRef;

  Buscar: string = '';
  fechaActual: string;
  BuscarPROV: string = '';
  BuscarM: string = '';
  buscador = false;
  NuevoProv: string = "";

  // Archivo
  Comprobantes: any[] = new Array();
  Cotizaciones: any[] = new Array();


  constructor(private firestore: Firestore, public router: Router, public storage: Storage) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.fechaActual = `${year}-${month}-${day}`;

    if (history.state[0] == "" || history.state[0] == undefined) {

    } else {
      localStorage.setItem('User', JSON.stringify(history.state[0]));
      localStorage.setItem('RequisicionCompra', JSON.stringify(history.state[1]));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);

    this.req = JSON.parse(localStorage.getItem('RequisicionCompra')!);

    this.preProductosReq = this.req.ProductosParaRequisicion;
  }

  ngOnInit() {
    const modalEstado = localStorage.getItem('modalEstado');
    if (modalEstado == 'cerrado') {
      this.cerrarModal();
    }

    this.ObtenerProductosAceptados();
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
    this.BuscarPROV = "";
    this.buscador = false;
  }

  Modal(ProductosE: ProductosRequisicion) {
    this.abrirModal();
    this.productoModal = ProductosE;
  }

  ObtenerProductosAceptados() {
    const X = collection(this.firestore, "RequisicionCompra");
    const Y = query(X, where("IdRequisicionCompra", "==", this.req.IdRequisicionCompra));

    collectionData(Y).subscribe((ssProductosparaRequisicion) => {
      if (ssProductosparaRequisicion.length > 0) {
        this.RequisicionCompra.setData(ssProductosparaRequisicion[0]);
        this.RequisicionCompra.ProductosParaRequisicion = this.RequisicionCompra.ProductosParaRequisicion
          .filter(producto => producto.Estatus !== 'No Aceptado')
          .sort((a, b) => a.Proveedor.localeCompare(b.Proveedor)); // Ordena por proveedor alfabéticamente
      }
    });
  }

  ProductosparaRequisicion(producto: Producto) {

    // if (!this.validarMetodoPagoYProveedor(producto)) {
    //  return;
    // }
  
    let productoReq = new ProductosRequisicion();
    productoReq.IdProducto = producto.IdProducto;
    productoReq.Nombre = producto.Nombre;
    productoReq.Categoria = producto.Categoria
    productoReq.Marca = producto.Marca;
    productoReq.CantidadBase = producto.CantidadBase;
    productoReq.MetodoPago = producto.MetodoPago;
    productoReq.Precio = producto.Precio;
    productoReq.Proveedor = producto.Proveedor;
    productoReq.Unidad = producto.Unidad;
    productoReq.IdProveedor = producto.IdProveedor;
    productoReq.Especificaciones = producto.Descripcion;
    productoReq.Estatus = "Pendiente";
  
    this.RequisicionCompra.ProductosParaRequisicion.push(productoReq);
  
    this.Buscar = "";
    this.Productos = new Array();
  }

  obtenerInformacionCheckboxMarcado(item: any) {
    const productosSeleccionados = this.RequisicionCompra.ProductosParaRequisicion.filter(p => p.agregarprod)[0];
    const Primerproducto = productosSeleccionados;
    // Esta función se llama cuando se hace clic en el checkbox de una fila
    // Solo imprime la información si el checkbox está marcado (true)
    if (item.agregarprod) {
      console.log(item);
      console.log(productosSeleccionados);
      // Aquí puedes realizar las operaciones que necesites con la información de la fila
    }
  }

  ValidarProveedor(item: any){
    
    const productosSeleccionados =this.RequisicionCompra.ProductosParaRequisicion.filter(p => p.agregarprod)
    const Primerproducto = productosSeleccionados[0];
    
    if(item.agregarprod){
      console.log(Primerproducto);
      if(Primerproducto.Proveedor !== item.Proveedor ){
        Swal.fire({
          position: 'center',
          icon: 'error',

          title: 'Todos los productos de la orden deben ser del mismo proveedor',
        }).then(() => {
          // Cambia el estado del checkbox a false
          item.agregarprod = false;
        });
        return false;
      }
  }
  return true;

}
  



  
  

   obtenerMetodoPagoPrimerProducto(): string {
    const productouno = this.RequisicionCompra.ProductosParaRequisicion.filter(p => p.agregarprod)[0];
    return productouno ? productouno.MetodoPago : '';
  }


  obtenerProveedorPrimerProducto(): string {
    const proveedoruno = this.RequisicionCompra.ProductosParaRequisicion.filter(p => p.agregarprod)[0];
    return proveedoruno ? proveedoruno.Proveedor : '';
  }


  CrearOrden() {
  const metodoPagoPrimerProducto = this.obtenerMetodoPagoPrimerProducto();
  console.log(metodoPagoPrimerProducto)
  const proveedorPrimerProducto = this.obtenerProveedorPrimerProducto();
  console.log(proveedorPrimerProducto)
  // Actualiza el folio pasado
  this.obtenerYActualizarFolio().then(({ folioOrdenAnterior, nuevoFolio }) => {
    // Asigna ambos valores del folio a la requisición
    this.OrdenCompra.FolioValor = folioOrdenAnterior;
    this.OrdenCompra.Folio = `ORD${nuevoFolio}`;
    // Crea una nueva orden de compra solo con los productos seleccionados
    let nuevaOrden = new OrdendeCompra();
    nuevaOrden.IdOrdendeCompra= "ORD-" + this.generateRandomString(10),
    nuevaOrden.Proveedor = proveedorPrimerProducto
    nuevaOrden.MetododePago = metodoPagoPrimerProducto
    nuevaOrden.Fecha= this.req.Fecha
    nuevaOrden.FechaValor= this.req.FechaValor
    nuevaOrden.AreaSolicitante= this.req.AreaSolicitante
    nuevaOrden.Solicitante= this.req.Solicitante
    nuevaOrden.NombreResponsable= this.req.NombreResponsable
    nuevaOrden.Justificacion= this.req.Justificacion
    nuevaOrden.Comprobante= this.req.Comprobante
    nuevaOrden.Cotizacion= this.req.Cotizacion
    nuevaOrden.CostoTotal= this.req.CostoTotal
    nuevaOrden.Estatus= "Generada"
    nuevaOrden.Folio= this.OrdenCompra.Folio
    nuevaOrden.FolioValor= this.OrdenCompra.FolioValor
    nuevaOrden.ProductosParaRequisicion= this.RequisicionCompra.ProductosParaRequisicion.filter(w=> w.agregarprod == true)
    this.RequisicionCompra.ProductosParaRequisicion.filter(w=> w.agregarprod == true).forEach(x=>{
      x.Estatus = "En Ord.Compra";
      x.agregarprod = false;
    })

    const primerProducto = this.RequisicionCompra.ProductosParaRequisicion.find(p => p.agregarprod);
  if (primerProducto) {
    primerProducto.agregarprod = false;
  }
    // Guarda la nueva orden de compra
    let ordenCompraDocRef = doc(this.firestore, "OrdendeCompra", nuevaOrden.IdOrdendeCompra);
    setDoc(ordenCompraDocRef, JSON.parse(JSON.stringify(nuevaOrden))).then(() => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Orden creada',
        timer: 1200
      });
      this.GuardarRequi(this.RequisicionCompra, false)
      //this.router.navigate(['/Requisiciones'], { state: this.Usuario });
    });
  });
}










  async obtenerYActualizarFolio(): Promise<{ folioOrdenAnterior: string, nuevoFolio: string }> {
    let folioDocRef = doc(this.firestore, 'OrdendeCompra', 'FolioValor');

    try {
      const folioOrdenDoc = await getDoc(folioDocRef);
      const folioOrdenAnterior = folioOrdenDoc.exists() ? folioOrdenDoc.data().Folio : '0';

      // 1 en 1
      const nuevoFolio = (parseInt(folioOrdenAnterior) + 1).toString();

      // Actualiza el valor del folio
      await setDoc(folioDocRef, { Folio: nuevoFolio }, { merge: true });

      return { folioOrdenAnterior, nuevoFolio };
    }
    catch (error) {
        console.error('Error al obtener o actualizar el folio:', error);
    throw error;
    }
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






  GuardarRequi(Actualizados: RequisicionCompra, alert: boolean) {
    // this.ArchivarComprobante(Actualizados);

    let productosAceptados = Actualizados.ProductosParaRequisicion.filter(producto => producto.Estatus !== "No Aceptado");

    this.CostoTotal = productosAceptados.reduce((total, producto) => {
      return total + (producto.Precio || 0) *  ((producto.Cantidad || 0) / (producto.CantidadBase || 0));


    }, 0);


    this.RequisicionCompra.CostoTotal = this.CostoTotal;

    if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "En Ord.Compra").length == 0) {
      this.RequisicionCompra.Estatus = "En Ord.Compra"
    } else if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "Recibido").length == 0) {
      this.RequisicionCompra.Estatus = "Recibida"
    } else { this.RequisicionCompra.Estatus = "Revisado" }

    /* Actualizar inventario
    this.RequisicionCompra.ProductosParaRequisicion.forEach(x => {

      if ((this.preProductosReq.find(w => w.IdProducto == x.IdProducto)?.Estatus != x.Estatus) && x.Estatus == "Recibido") {
        let dbInv = collection(this.firestore, "Inventario");
        let consulta = query(dbInv, where("IdProducto", "==", x.IdProducto));
        let flagInv = true;
        collectionData(consulta).subscribe((ssInventario) => {
          if (flagInv) {
            flagInv = false;
            let item = new Inventario();
            item.setData(ssInventario[0]!)
            item.Cantidad += x.Cantidad;
            console.log(item.Cantidad);
            let actProdInv = doc(this.firestore, 'Inventario', item.IdInventario);
            setDoc(actProdInv, JSON.parse(JSON.stringify(item))).then(() => {

            });
          }
        })
      }

    })*/

    // Obtén una referencia al documento de la Requisición de Compra
    Actualizados.CostoTotal = this.CostoTotal;
    let requisicionDocRef = doc(this.firestore, 'RequisicionCompra', Actualizados.IdRequisicionCompra);
    // Actualiza el documento de la Requisición de Compra con el nuevo array de productos
    setDoc(requisicionDocRef, JSON.parse(JSON.stringify(this.RequisicionCompra))).then(() => {
      if(alert){
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Datos guardados correctamente',
          timer: 1200
        });
      }
      this.router.navigate(['/Requisiciones'], { state: this.Usuario });
    });
  }



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

//CAMBIOS MODAL PROVEEDOR
ProveedorParaProducto(P: Proveedor) {
  console.log(this.productoModal);
  this.productoModal.IdProveedor = P.IdProveedor;
  this.productoModal.Proveedor = P.Nombre;
  this.productoModal.MetodoPago = P.MetodoPago;
  this.BuscarPROV = P.Nombre;
  this.buscador = false;
  console.log(this.productoModal)
}


filterProductosBySearchTerm() {
  this.buscador = true
  if (this.Buscar.trim() !== '') {
    const X = collection(this.firestore, "Producto");
    const Y = query(X, where("Nombre", "<=", this.Buscar + '\uf8ff'), where("Nombre", ">=", this.Buscar)); //Mod
    collectionData(Y).subscribe((ssProductosparaRequisicion) => {
      this.Productos = new Array()
      if (ssProductosparaRequisicion.length > 0) {
        console.log(ssProductosparaRequisicion)
        ssProductosparaRequisicion.forEach((item: any) => {
          let producto = new Producto();
          producto.setData(item);
          this.Productos.push(producto);
        })
      }
    });
    };

  }

}

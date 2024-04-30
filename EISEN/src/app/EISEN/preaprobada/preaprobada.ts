import { Component, Input, OnInit } from '@angular/core';
import { RequisicionCompra, Usuario, ProductosRequisicion, Inventario, Producto } from '../BD/BD';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData } from '@angular/fire/firestore';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'preaprobada',
  templateUrl: './preaprobada.html',
  styleUrls: ['./preaprobda.css']
})

export class preaprobadaComponent {

  req = new RequisicionCompra();
  Usuario = new Usuario();
  ProductosRequisicion: ProductosRequisicion[] = new Array();
  RequisicionCompra = new RequisicionCompra()
  preProductosReq: ProductosRequisicion[] = new Array();
  Productos: Producto[] = new Array()
  Requisicion: RequisicionCompra = new RequisicionCompra();

  //#region Variablesss
  Buscar:string='';
  buscador= false;
  CostoTotal: number = 0;
  Responsable: string = ""
  Selector: string = ""
  FechaReq: string = ""
  @ViewChild('xCosa') xCosaTextarea!: ElementRef;

  //#endregion


  constructor(private firestore: Firestore, private router: Router) {
    if (history.state[0] == "" || history.state[0] == undefined) {

    }
    else {
      localStorage.setItem('User', JSON.stringify(history.state[0]));
      localStorage.setItem('RequisicionCompra', JSON.stringify(history.state[1]));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);



    this.req = JSON.parse(localStorage.getItem('RequisicionCompra')!);

    this.Selector = this.req.AreaSolicitante;
    this.FechaReq = this.req.Fecha;

    this.preProductosReq = this.req.ProductosParaRequisicion;
  }

  

  ngOnInit() {
    this.ProductosDeLaRequisicion();
  }

  validarMetodoPagoYProveedor(producto: Producto): boolean {
    const primerProducto = this.RequisicionCompra.ProductosParaRequisicion[0];
  
    // Validación para que la requisición se haga con un mismo proveedor.
    if (primerProducto) {
      if (producto.Proveedor !== primerProducto.Proveedor) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Todos los productos deben ser del mismo proveedor',
        });
        this.Buscar = "";
        this.Productos = new Array();
        return false;   
      }
     }  
    return true;
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


  ProductosDeLaRequisicion() {
    let X = collection(this.firestore, "RequisicionCompra");
    let Y = query(X, where("IdRequisicionCompra", "==", this.req.IdRequisicionCompra));
    collectionData(Y).subscribe((ssProductosparaRequisicion) => {
      if (ssProductosparaRequisicion.length > 0) {
        this.RequisicionCompra.setData(ssProductosparaRequisicion[0])
      }
    });
  }

  async borrar(fila: ProductosRequisicion) {
    const index = this.RequisicionCompra.ProductosParaRequisicion.indexOf(fila);
    if (index >= 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: '¿Quieres borrar esta Producto de la Requisición?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        this.RequisicionCompra.ProductosParaRequisicion.splice(index, 1);
      }
    }
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


  validarNumeroStep(item:any, event:any) {
    const step = parseFloat(item.CantidadBase); // Obtén el valor del atributo 'step' como número
    const valorIngresado = parseFloat(item.Cantidad); // Obtén el valor ingresado como número

    if (isNaN(valorIngresado) || valorIngresado % step !== 0) {
      // Si el valor ingresado no es un número o no es un múltiplo del 'step', establece el valor en el múltiplo más cercano
      const valorAproximado = Math.round(valorIngresado / step) * step;
      item.Cantidad = valorAproximado;
    }
  }


  GuardarCambios(Actualizados: RequisicionCompra) {
    if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "Pagado").length == 0) {
      this.RequisicionCompra.Estatus = "Comprada"
    } else if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "Recibido").length == 0) {
      this.RequisicionCompra.Estatus = "Recibida"
    }

    this.CostoTotal = Actualizados.ProductosParaRequisicion.reduce((total, producto) => {
      // return total + (producto.Precio || 0) * (producto.Cantidad || 0);
       return total +  (producto.Precio || 0) * ((producto.Cantidad || 0) / (producto.CantidadBase || 0));
    }, 0);

    this.RequisicionCompra.ProductosParaRequisicion.forEach(x => {
      if ((this.preProductosReq.find(w => w.IdProducto == x.IdProducto)?.Estatus != x.Estatus) && x.Estatus == "Recibido") {
        let dbInv = collection(this.firestore, "Inventario");
        let consulta = query(dbInv, where("IdProducto", "==", x.IdProducto));
        let flagInv = true;
        collectionData(consulta).subscribe((ssInventario) => {
          if (flagInv) {
            if (ssInventario.length > 0) {
              flagInv = false;
              let item = new Inventario();
              item.setData(ssInventario[0]!)
              item.Cantidad += x.Cantidad;
              let actProdInv = doc(this.firestore, 'Inventario', item.IdInventario);
              setDoc(actProdInv, JSON.parse(JSON.stringify(item)));
            }
            //Si no existe un registro en el inventario crear uno
            else{
              let regInv = new Inventario();
              regInv.IdInventario = this.generateRandomString(12);
              regInv.IdProducto = x.IdProducto;
              regInv.Nombre = x.Nombre;
              regInv.Unidad = x.Unidad;
              regInv.Cantidad = x.Cantidad;
              regInv.Descripcion = x.Especificaciones;
              regInv.Marca = x.Marca
              regInv.Categoria = ""
              let actProdInv = doc(this.firestore, 'Inventario',regInv.IdInventario);
              setDoc(actProdInv, JSON.parse(JSON.stringify(regInv)));
            }
          }
        })
      }

    })

    Actualizados.CostoTotal = this.CostoTotal;
    let requisicionDocRef = doc(this.firestore, 'RequisicionCompra', Actualizados.IdRequisicionCompra);

    setDoc(requisicionDocRef, JSON.parse(JSON.stringify(this.RequisicionCompra))).then(() => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Datos guardados correctamente',
        timer: 1200
      });
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

    generateRandomString = (num: number) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result1 = '';
      const charactersLength = characters.length;
      for (let i = 0; i < num; i++) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      return result1;
    }

}

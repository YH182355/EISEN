import { Component, Input, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData } from '@angular/fire/firestore';
import { RequisicionCompra, Usuario, ProductosRequisicion, Producto, Inventario } from '../BD/BD';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { Console } from 'console';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'PantallaAprobar',
  templateUrl: './PantallaAprobar.html',
  styleUrls: ['./PantallaAprobar.css']
})


export class PantallaAprobar {

  preProductosReq: ProductosRequisicion[] = new Array();
  req = new RequisicionCompra();
  Usuario = new Usuario();
  Productos: Producto[] = new Array()
  ProductosRequisicion: ProductosRequisicion[] = new Array();
  VerDetallesProducto: ProductosRequisicion[] = new Array();
  RequisicionCompra = new RequisicionCompra()
  @ViewChild('xCosa') xCosaTextarea!: ElementRef;




  //#region Variablesss
  Solicitante: string = ""
  Responsable: string = ""
  Selector: string = ""
  FechaReq: string = ""
  CostoTotal: number = 0;
  habilitar: boolean = false;
  Buscar:string='';
  buscador= false;
  //#endregion


  constructor(private firestore: Firestore, public router: Router,) {
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
    this.Restriccion5k();
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
    const X = collection(this.firestore, "RequisicionCompra");
    const Y = query(X, where("IdRequisicionCompra", "==", this.req.IdRequisicionCompra));
    collectionData(Y).subscribe((ssProductosparaRequisicion) => {
      if (ssProductosparaRequisicion.length > 0) {
        this.RequisicionCompra.setData(ssProductosparaRequisicion[0])
        console.log(this.RequisicionCompra)
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


 GuardarCambios(Actualizados: RequisicionCompra) {
    
    this.CostoTotal = Actualizados.ProductosParaRequisicion.reduce((total, producto) => {
      // return total + (producto.Precio || 0) * (producto.Cantidad || 0);
       return total +  (producto.Precio || 0) * ((producto.Cantidad || 0) / (producto.CantidadBase || 0));
    }, 0);


    var Estatus = "";

    if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus === "Pendiente").length == 0) {
      Estatus = "Revisado"
    } else { Estatus = "Solicitado" }


    console.log(Estatus)

    let productosActualizadosArray = [...Actualizados.ProductosParaRequisicion];

    let productoIndex = productosActualizadosArray.findIndex(producto => producto.IdProducto === Actualizados.IdRequisicionCompra);

    if (productoIndex !== -1) {
      productosActualizadosArray[productoIndex].Estatus = Actualizados.Estatus;
    }

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

    updateDoc(requisicionDocRef, {
      Estatus: Estatus,
      CostoTotal: this.CostoTotal,
      ProductosParaRequisicion: productosActualizadosArray,
      Comentarios: this.RequisicionCompra.Comentarios
    }).then(() => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cambios guardados',
        showConfirmButton: false,
        timer: 1500
      });
      this.router.navigate(['/Requisiciones'], { state: this.Usuario });
    });


  }

  generateRandomString = (num: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = '';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
  }

  ModalEditarDatos(ProductosE: ProductosRequisicion) {
    this.abrirModal();
    console.log(ProductosE)
    const PE = collection(this.firestore, "Producto");
    const E = query(PE, where("IdProducto", "==", ProductosE.IdProducto));
    collectionData(E).subscribe((ssProductoEditar) => {
      this.VerDetallesProducto = new Array();
      if (ssProductoEditar.length > 0) {
        ssProductoEditar.forEach((item: any) => {
          let ProductoE = new Producto;
          ProductoE.setData(item);
          this.VerDetallesProducto.push(ProductosE);
          console.log(this.VerDetallesProducto)
        })
      }
    })

  }

  Restriccion5k() {
    console.log(this.req.CostoTotal);
    console.log(this.Usuario.Tipo);
    if (this.req.CostoTotal > 50000 && this.Usuario.Tipo == 'Admin') {
      this.habilitar = true;
      console.log("si");
    }
    else if (this.req.CostoTotal < 50000 && this.Usuario.Tipo == 'Gerente') {
      this.habilitar = true;
      console.log("si");
    }
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
  //#endregion


}
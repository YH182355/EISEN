import { Component, Input, OnInit } from '@angular/core';
import { RequisicionCompra, Usuario, ProductosRequisicion, Inventario } from '../BD/BD';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData } from '@angular/fire/firestore';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'VistaRequisicion',
  templateUrl: './VistaRequisicion.html',
  styleUrls: ['./VistaRequisicion.css']
})

export class VistaRequisicionComponent {

  req = new RequisicionCompra();
  Usuario = new Usuario();
  ProductosRequisicion: ProductosRequisicion[] = new Array();
  RequisicionCompra = new RequisicionCompra()
  preProductosReq: ProductosRequisicion[] = new Array();

  //#region Variablesss
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

  ProductosDeLaRequisicion() {
    let X = collection(this.firestore, "RequisicionCompra");
    let Y = query(X, where("IdRequisicionCompra", "==", this.req.IdRequisicionCompra));
    collectionData(Y).subscribe((ssProductosparaRequisicion) => {
      if (ssProductosparaRequisicion.length > 0) {
        this.RequisicionCompra.setData(ssProductosparaRequisicion[0])
      }
    });
  }


  GuardarCambios(Actualizados: RequisicionCompra) {
    if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "Pagado").length == 0) {
      this.RequisicionCompra.Estatus = "Comprada"
    } else if (this.RequisicionCompra.ProductosParaRequisicion.filter(producto => producto.Estatus !== "Recibido").length == 0) {
      this.RequisicionCompra.Estatus = "Recibida"
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

import { Component, Input, OnInit } from '@angular/core';
import { RequisicionCompra, Usuario, ProductosRequisicion, Inventario } from '../BD/BD';
import { Firestore, collection, query, where, getDocs, updateDoc, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'Requisicion',
  templateUrl: './RequisicionRecibida.html',
  styleUrls: ['./RequisicionRecibida.css']
})

export class RequisicionRecibidaComponent {

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

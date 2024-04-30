import { Component, OnInit } from '@angular/core';
import { RequisicionCompra, ProductosRequisicion, Usuario } from '../BD/BD';
import { Router } from '@angular/router';
import { Firestore, where, updateDoc, orderBy } from '@angular/fire/firestore';
import { collection, query, collectionData } from '@angular/fire/firestore';
import { doc, setDoc, deleteDoc, getDocs, limit } from 'firebase/firestore';
import Swal from 'sweetalert2';


@Component({
  selector: 'Historial',
  templateUrl: './HistorialRequisiciones.html',
  styleUrls: ['./HistorialRequisiciones.css']
})

export class HistorialComponent {

  Usuario = new Usuario();
  Requisicioness: RequisicionCompra[] = new Array();
  Fecha1 = new Date();
  Fecha2 = new Date();


  constructor(private firestore: Firestore, public router:Router, ){
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
    this.TodasRequisiciones();
  }

  TodasRequisiciones(){

    if(this.Usuario.Tipo !== "Administrativo"){
      const E = collection(this.firestore, "RequisicionCompra");
      // Ordenar por Numero de Folio
      // const O = query(E,orderBy("FolioValor", "desc")); 
      const C = query(E, where("Estatus", "!=", "Recibida",));

      collectionData(C).subscribe((ssRequisiciones) => {
        this.Requisicioness = new Array();
        if (ssRequisiciones.length > 0) {
          ssRequisiciones.forEach((item:any) => {
            let Requisicionx = new RequisicionCompra;
            Requisicionx.setData(item);
            this.Requisicioness.push(Requisicionx);
          })
        }
      })
    }
    else{
    const E = collection(this.firestore, "RequisicionCompra");
    const Y = query(E, orderBy('Fecha','desc') && orderBy("FolioValor", "asc")&& where("Solicitante", "==", this.Usuario.Nombre));
    collectionData(Y).subscribe((ssRequisiciones) => {
      this.Requisicioness = new Array();
      if (ssRequisiciones.length > 0) {
        ssRequisiciones.forEach((item:any) => {
          let Requisicionx = new RequisicionCompra;
          Requisicionx.setData(item);
          this.Requisicioness.push(Requisicionx);
        })
      }
    })
  }
}

  clickRequisicion(req: RequisicionCompra){
    let Parametros: any[] = new Array();
    Parametros.push(this.Usuario);
    Parametros.push(req);
    console.log(req.Estatus)

    if ((this.Usuario.Tipo == "Gerente" || this.Usuario.Tipo == "Admin") && req.Estatus !== "Recibida") {
      this.router.navigate(['/PantallaAprobar'], {state: Parametros});
      console.log({state: Parametros});

    }
    else if(this.Usuario.Tipo == "Compras" && req.Estatus !== "Recibida"){
      this.router.navigate(['/Requisicion-compra'], {state: Parametros});
    }
    else if(this.Usuario.Tipo == "Pagos" && req.Estatus !== "Recibida"){
      this.router.navigate(['/Pagos'], {state: Parametros});
    }
    else if(this.Usuario.Tipo == "Administrativo" && req.Estatus !== "Recibida") {
      this.router.navigate(['/VistaRequisicion'], {state: Parametros});
    }
    else{
      this.router.navigate(['/Requisicion'], {state: Parametros});
      console.log({state: Parametros});

    }

    console.log({state: Parametros});
  }

  buscarReqPorRango(Fecha1: Date, Fecha2: Date){
    let fecha1 = new Date(Fecha1);
    let fecha2 = new Date(Fecha2);
 
    const ReqsRef = collection(this.firestore, 'RequisicionCompra');
    const C = query(ReqsRef, where("FechaValor", ">=", fecha1.getTime()), where("FechaValor", "<=", fecha2.getTime()));
       collectionData(C).subscribe((ssFechasRango) => {
         this.Requisicioness = new Array();
         if (ssFechasRango.length > 0) {
           ssFechasRango.forEach((item:any) => {
             let Fechas = new RequisicionCompra;
             Fechas.setData(item);
             this.Requisicioness.push(Fechas);
           })
         }
       })
   }

   VaciarFiltros() {
    this.TodasRequisiciones();
    this.Fecha1 = new Date();
    this.Fecha2 = new Date();
  }


  

}


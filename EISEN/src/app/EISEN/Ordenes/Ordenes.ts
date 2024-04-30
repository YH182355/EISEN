import { Component, Input, OnInit } from '@angular/core';
import { orderBy } from 'firebase/firestore';
import { Firestore, collection, query, where, getDocs,updateDoc, collectionData } from '@angular/fire/firestore';
import { Proveedor, Usuario, RequisicionCompra, OrdendeCompra } from "../BD/BD";
import { doc, setDoc,deleteDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'Ordenes',
  templateUrl: './Ordenes.html',
  styleUrls: ['./Ordenes.css']
})

export class OrdenesComponent {

  Usuario = new Usuario();
  Ordeness: OrdendeCompra[] = new Array();
  


  constructor(private firestore: Firestore, public router:Router,){

    if(history.state.IdUsuario == "" || history.state.IdUsuario == undefined){
      
    }
    else{
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
  }

  ngOnInit() {
    this.TodasOrdenes();
  }






  TodasOrdenes(){
    const E = collection(this.firestore, "OrdendeCompra");
    // Ordenar por Numero de Folio
    // const O = query(E,orderBy("FolioValor", "desc")); 
    const C = query(E, where("Estatus", "!=", "Rechazada",));

    collectionData(C).subscribe((ssOrdenes) => {
      this.Ordeness = new Array();
      if (ssOrdenes.length > 0) {
        ssOrdenes.forEach((item:any) => {
          let Ordenx = new OrdendeCompra;
          Ordenx.setData(item);
          this.Ordeness.push(Ordenx);
        })
      }
    })
  }

  // Obtiene el estatus de la requisicion para cambiar los colores de los loaders
  obtenerClaseEstatus(estatus: string): string {
    switch (estatus) {
      case 'Generada':
        return 'estatus-verde';
        case 'Aprobada':
        return 'estatus-amarillo';
      case 'Pagada':
        return 'estatus-amarillo';
        case 'Recibida':
            return 'estatus-rojo';
      default:
        return '';
    }
  }
  


  clickOrden(ord: OrdendeCompra){
    let Parametros: any[] = new Array();
    Parametros.push(this.Usuario);
    Parametros.push(ord);
    
    if (this.Usuario.Tipo == "Gerente") {
      this.router.navigate(['/AprobarOrden'], {state: Parametros});
      console.log(Parametros);
    }
    else if(this.Usuario.Tipo == "Compras"){
      this.router.navigate(['/OrdenCompra'], {state: Parametros});
    }
    else if(this.Usuario.Tipo == "Pagos"){
      this.router.navigate(['/PagoOrden'], {state: Parametros});
    }
    console.log({state: ord});
  }

}

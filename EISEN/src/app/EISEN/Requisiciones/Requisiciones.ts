import { Component, Input, OnInit } from '@angular/core';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario, RequisicionCompra } from "../BD/BD";
import { orderBy } from 'firebase/firestore';

@Component({
  selector: 'Requisiciones',
  templateUrl: './Requisiciones.html',
  styleUrls: ['./Requisiciones.css']
})

export class RequisicionesComponent {

  Usuario = new Usuario();
  Requisicioness: RequisicionCompra[] = new Array();

  constructor(private firestore: Firestore, public router: Router) {
    if (history.state.IdUsuario == "" || history.state.IdUsuario == undefined) {

    } else {
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
  }

  ngOnInit() {
    this.TodasRequisiciones();
    // this.verificarEntregaUniformes();
  }



  Urgente(Requisicioness: { Urgente: boolean; }) {
    return Requisicioness.Urgente === true;
  }







  TodasRequisiciones() {
    if (this.Usuario.Tipo !== "Administrativo") {
      const E = collection(this.firestore, "RequisicionCompra");
      const C = query(E, where("Estatus", "!=", "Recibida") && orderBy ("Fecha", "asc"));
  
      collectionData(C).subscribe((ssRequisiciones) => {
        this.Requisicioness = [];
        if (ssRequisiciones.length > 0) {
          // Esto Ordena las requisiciones de la más antigua a la más reciente
          ssRequisiciones.sort((a: any, b: any) => {
            //la urgente debe ir primero
            if (a.Urgente && !b.Urgente) {
              return -1;
            } else if (!a.Urgente && b.Urgente) {
              return 1;
            }
            // Si hay mas de una urgente se ordenan por fecha
            return a.Fecha - b.Fecha;
          });
  
          ssRequisiciones.forEach((item: any) => {
            let Requisicionx = new RequisicionCompra;
            Requisicionx.setData(item);
            this.Requisicioness.push(Requisicionx);
          });
        }
      });
    } else {
      const E = collection(this.firestore, "RequisicionCompra");
      const C = query(E,where("Estatus", "!=", "Recibida") && where("Solicitante", "==", this.Usuario.Nombre));
  
      collectionData(C).subscribe((ssRequisiciones) => {
        this.Requisicioness = [];
        if (ssRequisiciones.length > 0) {
          ssRequisiciones.forEach((item: any) => {
            let Requisicionx = new RequisicionCompra;
            Requisicionx.setData(item);
            this.Requisicioness.push(Requisicionx);
          });
        }
      });
    }
  }
  

  obtenerClaseEstatus(estatus: string): string {
    switch (estatus) {
      case 'Solicitado':
      case 'Revisado':
        return 'estatus-verde';
      case 'Comprada':
        return 'estatus-amarillo';
      case 'Recibida':
        return 'estatus-rojo';
      default:
        return '';
    }
  }

  clickRequisicion(req: RequisicionCompra) {
    let Parametros: any[] = new Array();
    Parametros.push(this.Usuario);
    Parametros.push(req);

    if (this.Usuario.Tipo == "Administrativo") {
      if (req.Estatus == "Solicitado" && req.Solicitante == this.Usuario.Nombre) {
        this.router.navigate(['/preaprobada'], { state: Parametros });
      } else {
        this.router.navigate(['/VistaRequisicion'], { state: Parametros });
      }
    } else if (this.Usuario.Tipo == "Gerente" || this.Usuario.Tipo == "Admin") {
      this.router.navigate(['/PantallaAprobar'], { state: Parametros });
    } else if (this.Usuario.Tipo == "Compras") {
      this.router.navigate(['/Requisicion-compra'], { state: Parametros });
    } else if (this.Usuario.Tipo == "Pagos") {
      this.router.navigate(['/Pagos'], { state: Parametros });
    } else {
      this.router.navigate(['/VistaRequisicion'], { state: Parametros });
    }
  }

  //#region Alerta amber
  verificarEntregaUniformes() {
    const tiempo = 4 * 30 * 24 * 60 * 60 * 1000; // estos son 4 meses pasados a milisegundos

    this.Requisicioness.forEach(requisicion => {
      const validarUniforme = requisicion.ProductosParaRequisicion.some(producto => producto.Categoria === 'Uniforme');

      if (validarUniforme) {
        const fechaActual = new Date().getTime();
        const fechaCreacion = requisicion.FechaValor;

        const diferenciadetiempo = fechaActual - fechaCreacion;

        if (diferenciadetiempo >= tiempo) {
          if (validarUniforme) {
            console.log("Tiene uniforme:", requisicion.Folio);
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: 'Ha pasado más de 4 meses desde la entrega de uniformes sobre la' + requisicion.Folio,
            });
            return;
          }
        }
      }
    });
  }
  //#endregion


}



import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, where, updateDoc, orderBy } from '@angular/fire/firestore';
import { collection, query, collectionData, } from '@angular/fire/firestore';
import { Inventario, Usuario, Proveedor, Entrega } from '../BD/BD';
import Swal from 'sweetalert2';
import { doc, setDoc, deleteDoc, getDocs, limit } from 'firebase/firestore';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';


@Component({
  selector: 'Entregas',
  templateUrl: './Entregas.html',
  styleUrls: ['./Entregas.css']
})


export class EntregasComp implements OnInit {

  Usuario = new Usuario();
  Empresas: Inventario[] = [];
  Recogido: Entrega = new Entrega();
  Mucho: Entrega[] = [];

  Buscar: string = '';
  CategoriaOpcion: string = 'Categoria';
  Fecha1 = new Date();
  Fecha2 = new Date();

  constructor(private firestore: Firestore, private router: Router) {
    if (history.state.IdUsuario == "" || history.state.IdUsuario == undefined) {
    } else {
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario.Tipo);
    if (this.Usuario.Tipo != "Compras" && this.Usuario.Tipo != "Gerente"  && this.Usuario.Tipo != "Pagos") {
      this.router.navigate(['/Requisiciones']);
    }
  }

  //#region Modalesss
  abrirModal1() {
    const modal = document.getElementById('myModal1') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'block';
      localStorage.setItem('modalEstado', 'abierto');
    }
  }

  cerrarModal1() {
    const modal = document.getElementById('myModal1') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'none';
      localStorage.setItem('modalEstado', 'cerrado');
    }
  }

  //#endregion

  ngOnInit() {
    this.CargarEn();
    const modalEstado = localStorage.getItem('modalEstado');
    if (modalEstado == 'cerrado') {
      this.cerrarModal1();
    }
  }

  VaciarFiltros() {
    this.CategoriaOpcion = "Categoria";
    this.filtrarDatos();
    this.Fecha1 = new Date();
    this.Fecha2 = new Date();
  }

  filtrarDatos() {
    const I = collection(this.firestore, "Entrega");
    let queryFilter = query(I);

    if (this.CategoriaOpcion !== 'Categoria') {
      queryFilter = query(queryFilter, where("Producto.Categoria", "==", this.CategoriaOpcion));
    }

    if (this.Buscar) {
      queryFilter = query(queryFilter, where("Producto.Nombre", "==", this.Buscar));
    }

    collectionData(queryFilter).subscribe((ssInventario) => {
      this.Mucho = ssInventario.map((item: any) => {
        let Inventariox = new Entrega();
        Inventariox.setData(item);
        return Inventariox;
      });
    });
    this.Buscar = ""
  }

  async CargarEn() {
    const R = collection(this.firestore, "Entrega");
    const S = query(R, orderBy('FechaEntrega','desc'), limit(20));
    const querySnapshot = await getDocs(S);
    this.Mucho = querySnapshot.docs.map((doc) => doc.data() as Entrega);
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

  async borrar(fila: Entrega) {
    const index = this.Mucho.indexOf(fila);
    console.log(this.Mucho);
    if (index >= 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: '¿Quieres borrar esta Entrega?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        const productoEnInventario = this.Mucho.find((producto) => producto.Producto.IdInventario === fila.Producto.IdInventario);
        console.log(productoEnInventario)

        if (productoEnInventario) {
          productoEnInventario.Cantidad += fila.Cantidad;
          const inventarioDocRef = doc(this.firestore, 'Inventario', productoEnInventario.Producto.IdInventario);
          setDoc(inventarioDocRef, JSON.parse(JSON.stringify(productoEnInventario.Producto))).then(() => {
          });
        }

        const docRef = doc(this.firestore, 'Entrega', fila.IdEntrega);
        await deleteDoc(docRef);
        this.Mucho.splice(index, 1);
        console.log(this.Mucho);
      }
    }
  }

  abrirEntrega(cosa: Entrega) {
    this.abrirModal1();
    console.log(cosa)
    this.Recogido = JSON.parse(JSON.stringify(cosa));
  }

  //#region PDFFFFFFF
  pdf() {
    const Cosa: HTMLElement = document.getElementById('elden')!;


    html2canvas(Cosa).then((canvas) => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'pt', 'letter');

      const ancho = pdf.internal.pageSize.getWidth();
      const alto = (canvas.height * ancho) / canvas.width;

      pdf.addImage(img, 'PNG', 0, 0, ancho, alto);

      pdf.save('Reporte_de_Entregas.pdf');

    });

  }
  //#endregion


  //#region Pruebaaaaa
  buscarEntregasPorRango(Fecha1: Date, Fecha2: Date){
   let fecha1 = new Date(Fecha1);
   let fecha2 = new Date(Fecha2);

   const entregasRef = collection(this.firestore, 'Entrega');
   const C = query(entregasRef, where("FechaEntregaValor", ">=", fecha1.getTime()), where("FechaEntregaValor", "<=", fecha2.getTime()));
      collectionData(C).subscribe((ssFechasRango) => {
        this.Mucho = new Array();
        if (ssFechasRango.length > 0) {
          ssFechasRango.forEach((item:any) => {
            let Fechas = new Entrega;
            Fechas.setData(item);
            this.Mucho.push(Fechas);
          })
        }
      })
  }


  //#endregion


}
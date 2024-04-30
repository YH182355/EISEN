import { Component, Input, OnInit } from '@angular/core';
import { Producto, RequisicionCompra, ProductosRequisicion, Usuario, Proveedor } from '../BD/BD';
import { getDocs } from 'firebase/firestore';
import { Storage} from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, where } from '@angular/fire/firestore';
import { collection, query, collectionData } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { doc, setDoc,deleteDoc,getDoc } from 'firebase/firestore';
import { ViewChild, ElementRef } from '@angular/core';



@Component({
  selector: 'NuevaRequisicion',
  templateUrl: './NuevaRequisicion.html',
  styleUrls: ['./NuevaRequisicion.css']
})


export class NuevaRequisicionComponent {

  CheckBoxValor: boolean = false;
  Usuario = new Usuario();
  Productos: Producto[] = new Array()
  Requisicion: RequisicionCompra = new RequisicionCompra();
  BorrarFila: ProductosRequisicion[] = []

  //#region Variablesss
  Buscar:string='';
  buscador= false;
  fechaActual:string;
  Solicitante:string="";
  Selector:string="";
  CostoTotal:number=0;
  @ViewChild('xCosa') xCosaTextarea!: ElementRef;
  //#endregion


  ngOnInit(){

  }

  constructor(private firestore: Firestore, public router:Router,){

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.fechaActual = `${year}-${month}-${day}`;


    if(history.state.IdUsuario == "" || history.state.IdUsuario == undefined){

    }
    else{
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);
    this.Requisicion.Solicitante = this.Usuario.Nombre;
  }







//#region Barra de busqueda exotica

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

  validarMetodoPagoYProveedor(producto: Producto): boolean {
    const primerProducto = this.Requisicion.ProductosParaRequisicion[0];
  
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
  


    if(producto.Categoria ==  "Uniformes" && this.Usuario.Tipo !== 'Pagos'){
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Solo el Usuario de Tipo Pagos puede Agregar Uniformes a la Requisición',
      });
      return; 
   
    }
    this.Requisicion.ProductosParaRequisicion.push(productoReq);
  
    
  
    this.Buscar = "";
    this.Productos = new Array();
  }
  




  CrearRequisicion() {

    const today = new Date();
    const dayOfMonth = today.getDate();


    // Alerta por si intentan crear una requisición en dias no habiles 
    if (dayOfMonth > 8 && !this.CheckBoxValor) {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Solo se pueden crear requisiciones en los primeros 8 días del mes, a menos que sea urgente',
            timer: 2500
        });
        return;
    }

    // Alerta por si dejan vacía el área solicitante
    if (!this.Requisicion.AreaSolicitante) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'El campo Área no puede estar vacío',
      });
      return;
    }

   





    // Verifica que todos los productos sean del mismo proveedor o ten gan el mismo metodo de pago y si no arroja una alerta
    // let primerProducto = this.Requisicion.ProductosParaRequisicion[0];
    // if (this.Requisicion.ProductosParaRequisicion.some(producto => producto.MetodoPago !== primerProducto.MetodoPago || producto.Proveedor !== primerProducto.Proveedor)) {
    //   Swal.fire({
    //     position: 'center',
    //     icon: 'error',
    //     title: 'Todos los productos deben tener el mismo método de pago y proveedor',
    //   });
    //   return;
    // }


    this.CostoTotal = this.Requisicion.ProductosParaRequisicion.reduce((total, producto) => {
      // return total + (producto.Precio || 0) * (producto.Cantidad || 0);
       return total +  (producto.Precio || 0) * ((producto.Cantidad || 0) / (producto.CantidadBase || 0));
    }, 0);


    this.Requisicion.IdRequisicionCompra = "ID-" + this.generateRandomString(10);


    //  actualiza el folio pasado
    this.obtenerYActualizarFolio().then(({ folioAnterior, nuevoFolio }) => {
      // Asigna ambos valores del folio a la requisición
      this.Requisicion.FolioValor = folioAnterior;
      this.Requisicion.Folio = `REQ${nuevoFolio}`;
      this.Requisicion.Fecha = this.fechaActual;
      let FechaBase = new Date(this.fechaActual);
      this.Requisicion.FechaValor = FechaBase.getTime();
      this.Requisicion.Estatus = "Solicitado";
      this.Requisicion.CostoTotal = this.CostoTotal;
      this.Requisicion.Urgente = this.CheckBoxValor;

      let si = doc(this.firestore, "RequisicionCompra", this.Requisicion.IdRequisicionCompra);
      setDoc(si, JSON.parse(JSON.stringify(this.Requisicion))).then(() => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Requisición creada',
          timer: 1200
        });
        this.router.navigate(['/Requisiciones'], { state: this.Usuario });
      });
    });
  }





  async obtenerYActualizarFolio(): Promise<{ folioAnterior: string, nuevoFolio: string }> {
    let folioDocRef = doc(this.firestore, 'RequisicionCompra', 'FolioValor');

    try {
      const folioDoc = await getDoc(folioDocRef);
      const folioAnterior = folioDoc.exists() ? folioDoc.data().Folio : '0';

      // 1 en 1
      const nuevoFolio = (parseInt(folioAnterior) + 1).toString();

      // Actualiza el valor del folio
      await setDoc(folioDocRef, { Folio: nuevoFolio }, { merge: true });

      return { folioAnterior, nuevoFolio };
    }
    catch (error) {
        console.error('Error al obtener o actualizar el folio:', error);
    throw error;
    }
  }








  async borrar(fila: ProductosRequisicion) {
    const index = this.Requisicion.ProductosParaRequisicion.indexOf(fila);
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
        this.Requisicion.ProductosParaRequisicion.splice(index, 1);
      }
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







  //#region Pruebaaaaaaa
  validarNumeroStep(item:any, event:any) {
    const step = parseFloat(item.CantidadBase); // Obtén el valor del atributo 'step' como número
    const valorIngresado = parseFloat(item.Cantidad); // Obtén el valor ingresado como número

    if (isNaN(valorIngresado) || valorIngresado % step !== 0) {
      // Si el valor ingresado no es un número o no es un múltiplo del 'step', establece el valor en el múltiplo más cercano
      const valorAproximado = Math.round(valorIngresado / step) * step;
      item.Cantidad = valorAproximado;
    }
  }
  //#endregion

    //#region Comentariooooss

    comentario(com: string) {
      let Fecha = new Date();
      let date = Fecha.getDate() + '-' + (Fecha.getMonth() + 1) + '-' + Fecha.getFullYear() + ' ' + Fecha.getHours() + ':' + Fecha.getMinutes()
      this.Requisicion.Comentarios.push({
        User: this.Usuario.Nombre,
        Comentario: com,
        Fecha: date,
        Estatus: "Solicitado"
      })
      if (this.xCosaTextarea) {
        this.xCosaTextarea.nativeElement.value = '';
      }
    }
    //#endregion


}

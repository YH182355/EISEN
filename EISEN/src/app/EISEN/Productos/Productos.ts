import { Component, Input, OnInit } from '@angular/core';
import { Producto, ProductosRequisicion, Usuario, Proveedor, Inventario } from '../BD/BD';
import { Router } from '@angular/router';
import { Firestore, limit, where } from '@angular/fire/firestore';
import { collection, query, collectionData, updateDoc } from '@angular/fire/firestore';
import { doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';


@Component({
  selector: 'Productos',
  templateUrl: './Productos.html',
  styleUrls: ['./Productos.css']
})

export class ProductosComponent implements OnInit {

  Usuario = new Usuario();
  Productoss: Producto[] = new Array();
  EditarProducto: Producto[] = new Array();
  Proveedor: Proveedor[] = new Array();
  DetallesModal = new Inventario;
  DetallesProductoz: Producto[] = new Array();

  NuevoProducto: Producto = new Producto();
  NuevoPInv: Inventario = new Inventario();


  //#region Variables
  Buscar: string = '';
  BuscarM: string = '';
  CategoriaOpcion: string = 'Categoria';
  buscador = false;



  //#endregion

  ngOnInit() {
    this.TodoProductos();

    const modalEstado = localStorage.getItem('modalEstado');
    if (modalEstado == 'cerrado') {
      this.cerrarModal();
    }
    const modalEstado2 = localStorage.getItem('modalEstado2');
    if (modalEstado2 == 'cerrado') {
      this.cerrarModal2();
    }
    const modalEstado3 = localStorage.getItem('modalEstado3');
    if (modalEstado3 == 'cerrado') {
      this.cerrarModal3();
    }
  }


  constructor(private firestore: Firestore, public router: Router,) {
    if (history.state.IdUsuario == "" || history.state.IdUsuario == undefined) {

    }
    else {
      localStorage.setItem('User', JSON.stringify(history.state));
    }
    this.Usuario = new Usuario();
    this.Usuario = JSON.parse(localStorage.getItem('User')!);
    console.log(this.Usuario);
  }



  //#region Modaaaaal
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
    this.BuscarM = "";
    this.buscador = false;
  }

  abrirModal2() {
    const modal = document.getElementById('myModal2') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'block';
      localStorage.setItem('modalEstado', 'abierto');
    }
  }

  cerrarModal2() {
    const modal = document.getElementById('myModal2') as HTMLElement | null;
    if (modal) {
      modal.style.display = 'none';
      localStorage.setItem('modalEstado', 'cerrado');
    }
    this.BuscarM = "";
    this.buscador = false;
  }

  abrirModal3() {
    const modal3 = document.getElementById('myModal3') as HTMLElement | null;
    if (modal3) {
      modal3.style.display = 'block';
      localStorage.setItem('modalEstado3', 'abierto');
    }
  }

  cerrarModal3() {
    const modal3 = document.getElementById('myModal3') as HTMLElement | null;
    if (modal3) {
      modal3.style.display = 'none';
      localStorage.setItem('modalEstado3', 'cerrado');
    }
  }
  //#endregion


  //#region Tabla
  TodoProductos() {
    const E = collection(this.firestore, "Producto");
     //acomoda alfabeticamente con el orderBy
    const C = query(E, orderBy("Nombre")); // Añade orderBy("Nombre") para ordenar alfabéticamente por el campo "Nombre"
    
    collectionData(C).subscribe((ssProducto) => {
      this.Productoss = new Array();
      if (ssProducto.length > 0) {
        ssProducto.forEach((item: any) => {
          let Productox = new Producto;
          Productox.setData(item);
          this.Productoss.push(Productox);
        })
      }
    })
  }

  VaciarFiltros() {
    this.TodoProductos();
    this.CategoriaOpcion = "Categoria"
  }

  ProductoCategoria(event: Event) {
    console.log(event);
    const categoriaa = (event.target as HTMLSelectElement).value;
    const I = collection(this.firestore, "Producto");
    const C = query(I, where("Categoria", "==", categoriaa), orderBy("Nombre"));
    collectionData(C).subscribe((ssProductoCategoria) => {
      this.Productoss = new Array();
      if (ssProductoCategoria.length > 0) {
        ssProductoCategoria.forEach((item: any) => {
          let Productox = new Producto;
          Productox.setData(item);
          this.Productoss.push(Productox);
        })
      }
    })
  }

  Buscador() {
    const I = collection(this.firestore, "Producto");
    const C = query(I, where("Nombre", "<=", this.Buscar + '\uf8ff'), where("Nombre", ">=", this.Buscar));
    collectionData(C).subscribe((ssProductoBuscador) => {
      this.Productoss = new Array();
      if (ssProductoBuscador.length > 0) {
        ssProductoBuscador.forEach((item: any) => {
          let Productox = new Producto;
          Productox.setData(item);
          this.Productoss.push(Productox);
        })
      }
    })
    console.log(this.Buscar);
    this.Buscar = '';
  }

  //#endregion




  //#region Barra de busqueda exotica

  filterProductosBySearchTerm() {
    this.buscador = true
    if (this.BuscarM.trim() !== '') {
      const X = collection(this.firestore, "Proveedor");
      const Y = query(X, where("Nombre", "<=", this.BuscarM + '\uf8ff'), where("Nombre", ">=", this.BuscarM)); //Mod
      collectionData(Y).subscribe((ssProveedores) => {
        this.Proveedor = new Array()
        if (ssProveedores.length > 0) {
          console.log(ssProveedores)
          ssProveedores.forEach((item: any) => {
            let producto = new Proveedor();
            producto.setData(item);
            this.Proveedor.push(producto);
          })
        }
      });
    };

  }


  //#endregion

  ModalEditarDatos(ProductosE: Producto) {
    this.abrirModal();
    console.log(ProductosE)
    const PE = collection(this.firestore, "Producto");
    const E = query(PE, where("IdProducto", "==", ProductosE.IdProducto));
    collectionData(E).subscribe((ssProductoEditar) => {
      this.EditarProducto = new Array();
      if (ssProductoEditar.length > 0) {
        ssProductoEditar.forEach((item: any) => {
          let ProductoE = new Producto;
          ProductoE.setData(item);
          this.EditarProducto.push(ProductoE);
          console.log(this.EditarProducto)
        })
      }
    })

  }

  GuardarCambios(Productoss: Producto) {
    console.log(Productoss);
    const a = doc(this.firestore, 'Producto', Productoss.IdProducto);
    updateDoc(a, {
      Proveedor: Productoss.Proveedor,
      Nombre: Productoss.Nombre,
      Unidad: Productoss.Unidad,
      CantidadBase: Productoss.CantidadBase,
      Categoria: Productoss.Categoria,
      Estatus: Productoss.Estatus,
      Precio: Productoss.Precio,  // Cambiar a Precio
      Descripcion: Productoss.Descripcion,
      Marca: Productoss.Marca
    });
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Cambios guardados',
      showConfirmButton: false,
      timer: 1500
    })
    this.VaciarFiltros();
    this.cerrarModal();
  }
  
  

  // GuardarCambios(Productoss: Producto) {
  //   console.log(Productoss);
  //   const a = doc(this.firestore, 'Producto', Productoss.IdProducto);
  //   updateDoc(a, {
  //     Proveedor: Productoss.Proveedor,
  //     Nombre: Productoss.Nombre,
  //     Unidad: Productoss.Unidad,
  //     CantidadBase: Productoss.CantidadBase,
  //     Categoria: Productoss.Categoria,
  //     Estatus: Productoss.Estatus,
  //     PrecioBase: Productoss.Precio,
  //     Descripcion: Productoss.Descripcion,
  //     Marca: Productoss.Marca
  //   });
  //   Swal.fire({
  //     position: 'center',
  //     icon: 'success',
  //     title: 'Cambios guardardados',
  //     showConfirmButton: false,
  //     timer: 1500
  //   })
  //   this.cerrarModal();
  // }


  async borrar(x: Producto) {
    console.log(x);
    const index = this.Productoss.indexOf(x);
    console.log(index);
    if (index >= 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: '¿Quieres borrar esta producto?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        const docRef = doc(this.firestore, 'Producto', x.IdProducto);
        await deleteDoc(docRef);
        this.Productoss.splice(index, 0);
      }
    }
  }

  ProveedorParaProducto(P: Proveedor) {
    this.NuevoProducto.IdProveedor = P.IdProveedor;
    this.NuevoProducto.Proveedor = P.Nombre;
    this.NuevoProducto.MetodoPago = P.MetodoPago;
    this.BuscarM = P.Nombre;
    this.buscador = false;
  }

  ProveedorParaProductoact(P: Proveedor) {
    this.EditarProducto[0].IdProveedor = P.IdProveedor;
    this.EditarProducto[0].Proveedor = P.Nombre;
    this.EditarProducto[0].MetodoPago = P.MetodoPago;
    this.BuscarM = P.Nombre;
    this.buscador = false;
  }



  GuardarNuevoProducto() {
    this.NuevoProducto.IdProducto = "ID-" + this.generateRandomString(10);
    this.NuevoPInv.IdInventario = "ID-" + this.generateRandomString(10);
    this.NuevoPInv.IdProducto = this.NuevoProducto.IdProducto;
    this.NuevoPInv.Nombre = this.NuevoProducto.Nombre;
    this.NuevoPInv.Marca = this.NuevoProducto.Marca;
    this.NuevoPInv.Categoria = this.NuevoProducto.Categoria;
    this.NuevoPInv.Unidad = this.NuevoProducto.Unidad;
    this.NuevoPInv.Descripcion = this.NuevoProducto.Descripcion;

    console.log(this.NuevoProducto)
    console.log(this.NuevoPInv);

    if (this.NuevoProducto.Precio < 1000) {
      let si = doc(this.firestore, "Producto", this.NuevoProducto.IdProducto);
      setDoc(si, JSON.parse(JSON.stringify(this.NuevoProducto))).then(() => {
        this.NuevoProducto = new Producto();
      });

      let x = doc(this.firestore, "Inventario", this.NuevoPInv.IdInventario);
      setDoc(x, JSON.parse(JSON.stringify(this.NuevoPInv))).then(() => {
        Swal.fire({
          position: 'top',
          icon: 'success',
          title: 'Producto agregado exitosamente!',
          showConfirmButton: true,
          timer: 1200
        });
        this.NuevoPInv = new Inventario();
        this.cerrarModal2();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Solo se pueden agregar productos con un precio menor a $1000!",
        footer: '<a href="NuevoProducto">Comienza el proceso de nuevo producto</a>'
      });
    }


  }

  DetallesInventario(InventarioDetalles: Producto) {
    this.abrirModal3();
    let PE = collection(this.firestore, "Inventario");
    let E = query(PE, where("IdProducto", "==", InventarioDetalles.IdProducto));
    collectionData(E).subscribe((ssInventario) => {
      if (ssInventario.length > 0) {
        ssInventario.forEach((item: any) => {
          this.DetallesModal = new Inventario();
          this.DetallesModal.setData(item);
        })
      }
      else{
        this.DetallesModal = new Inventario();
        this.DetallesModal.IdInventario = this.generateRandomString(12);
        this.DetallesModal.IdProducto =InventarioDetalles.IdProducto;
        this.DetallesModal.Nombre = InventarioDetalles.Nombre;
        this.DetallesModal.Unidad = InventarioDetalles.Unidad;
        this.DetallesModal.Cantidad = 0;
        this.DetallesModal.Descripcion = InventarioDetalles.Descripcion;
        this.DetallesModal.Marca = InventarioDetalles.Marca
        this.DetallesModal.Categoria = InventarioDetalles.Categoria;
      }
    })
  }

  DetallesProducto(idProducto: string) {
    //this.abrirModal();
    let PE = collection(this.firestore, "Producto");
    let E = query(PE, where("IdProducto", "==", idProducto));
    collectionData(E).subscribe((ssProducto) => {
      this.DetallesProductoz = new Array();
      if (ssProducto.length > 0) {
        ssProducto.forEach((item: any) => {
          let ProductoDetalles = new Producto;
          ProductoDetalles.setData(item);
          this.DetallesProductoz.push(ProductoDetalles);

        })
      }
    })

  }

  ActualizarInventario(ProductoInv: Inventario) {
    const I = doc(this.firestore, 'Inventario', ProductoInv.IdInventario);
    setDoc(I, JSON.parse(JSON.stringify(ProductoInv))).then(()=>{
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cambios guardardados',
        showConfirmButton: false,
        timer: 1500
      })
      this.cerrarModal3();
    });
  }

  //#region Cosas adicionales

  generateRandomString = (num: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = '';
    const charactersLenght = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLenght));
    }
    return result1;
  }

  //#endregion

  





  
// -------------------------------pdf--------------------------------------------
  pdf(){
  const elemento: HTMLElement | null = document.getElementById('elden');

  if (elemento) {
    html2canvas(elemento).then((canvas) => {
      const imgData: string = canvas.toDataURL('image/png');
      const pdf: jsPDF = new jsPDF('portrait', 'pt', 'letter');
      const ancho: number = pdf.internal.pageSize.getWidth();
      const margenInferior: number = 10; // Define el margen inferior que deseas
      let alto: number = ((canvas.height - margenInferior) * ancho) / canvas.width;
      let posicionY: number = 0;

      while (posicionY < canvas.height) {
        if (posicionY + pdf.internal.pageSize.getHeight() > canvas.height) {
          alto = (canvas.height - posicionY) * ancho / canvas.width;
        }
        pdf.addImage(imgData, 'PNG', 0, -posicionY, ancho, alto);
        posicionY += (pdf.internal.pageSize.getHeight() - margenInferior);

        if (posicionY < canvas.height) {
          pdf.addPage();
        }
      }

      pdf.save('Reporte_de_Entregas.pdf');
    });
  }
}



  




  
  
  
  


  

  



  


}



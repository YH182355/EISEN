import { Byte } from "@angular/compiler/src/util"
import { stringify } from "querystring"

export class Usuario{
    
    public IdUsuario:string=""       //Id del usuario
    public Password:string=""     //Contraseña
    public User:string=""        //Nombre de la cuenta
    public Nombre:string=""         //Nombre del usuario
    public Tipo:string=""          //Jerarquía dentro de la empresa
    

    setData(data: any){
        this.IdUsuario = data.IdUsuario;
        this.Password = data.Password;
        this.User = data.User;
        this.Nombre = data.Nombre;
        this.Tipo = data.Tipo;
    }
}

export class Inventario{

    public IdInventario:string=""           //Id del Inventario
    public IdProducto:string=""              //Id del producto 
    public Nombre:string=""                 //Nombre del articulo
    public Unidad:string=""                //cm, litros, etc
    public Cantidad:number=0              //Cantidad existente en el inventario
    public Descripcion:string=""            //Campo para especificar el articulo
    public Categoria:string=""              //Categoria a la que pertenece
    public Marca:string=""
    

    setData(data: any){
        this.IdInventario = data.IdInventario;
        this.IdProducto = data.IdProducto;
        this.Nombre = data.Nombre;
        this.Unidad = data.Unidad;
        this.Cantidad = data.Cantidad;
        this.Descripcion = data.Descripcion;
        this.Categoria = data.Categoria;
        this.Marca = data.Marca;
    }
}

export class Producto{

    public IdProducto:string=""              //Id del catálogo 
    public Nombre:string=""                 //Nombre del articulo
    public Unidad:string=""                //cm, litros, etc
    public Descripcion:string=""            //Campo para especificar el articulo
    public Precio:number = 0                //Lo que cuesta
    public IdProveedor:string=""
    public Proveedor:string=""                 //Nombre del proveedor
    public Categoria:string=""              //Categoria a la que pertenece
    public MetodoPago:string=""
    public Marca:string=""
    public CantidadBase:number = 0
    public Estatus:string=""
    
    

    setData(data: any){
        this.IdProducto = data.IdProducto;
        this.Nombre = data.Nombre;
        this.Unidad = data.Unidad;
        this.Descripcion = data.Descripcion;
        this.Precio = data.Precio;
        this.IdProveedor = data.IdProveedor;
        this.Proveedor = data.Proveedor;
        this.Categoria = data.Categoria;
        this.MetodoPago = data.MetodoPago;
        // this.Cantidad = data.Cantidad;
        this.Marca = data.Marca;
        this.CantidadBase = data.CantidadBase;
        this.Estatus = data.Estatus;
    }
}

export class ProductosRequisicion{

    public IdProducto:string=""
    public Nombre:string=""                       //Nombre del producto pq Producto no encaja
    public Especificaciones:string=""
    public Cantidad:number=0
    public CantidadBase:number=0
    public Categoria: string=""
    public Unidad:string=""
    public Estatus:string=""
    public Precio:number=0;
    public MetodoPago:string=""
    public FechaPago:string=""
    public FechaRecibido:string=""
    public FechaPagoValor:number=0
    public Proveedor:string=""
    public IdProveedor:string=""
    public Observaciones:string=""
    public Marca:string=""
    public agregarprod: boolean = false;



    setData(data: any){
        this.IdProducto = data.IdProducto;
        this.Nombre = data.Nombre;
        this.Especificaciones = data.Especificaciones;
        this.Cantidad = data.Cantidad;
        this.CantidadBase = data.CantidadBase;
        this.Categoria = data.Categoria;
        this.Unidad = data.Unidad;
        this.Estatus = data.Estatus;
        this.Precio = data.Precio;
        this.MetodoPago = data.MetodoPago;
        this.FechaPago = data.FechaPago;
        this.FechaRecibido = data.FechaRecibido;
        this.FechaPagoValor = data.FechaPagoValor;
        this.Proveedor = data.Proveedor;
        this.IdProveedor = data.IdProveedor;
        this.Observaciones = data.Observaciones;
        this.Marca = data.Marca;
        this.agregarprod = data.CheckBoxProd;
    }
}

export class RequisicionCompra{
    filter(arg0: (requisicion: any) => any) {
      throw new Error('Method not implemented.')
    }
    
    // public FechaNotificacionUniformes: number = 0;


    public IdRequisicionCompra:string=""           //Id de la Requisición
    public Fecha:string=""                                   //Fecha de la realización de la requisición  string y number
    public FechaValor:number=0;
    public AreaSolicitante:string=""                    //Área de la oficina o almacen
    public Solicitante:string=""                         //Nombre del solicitante (Nombre del usuario)
    public NombreResponsable:string="Ing. Carlos Guzman"                 //Nombre del responsable (Mejia)
    public Justificacion:string=""                          //Razón de compra
    Comprobante:string[]= new Array()                         //Rutas de documento
    Cotizacion: string[]= new Array()                            //Rutas de documento (actualizado)
    public CostoTotal:number=0;
    public Estatus: string=""
    public Folio: string =""
    public FolioValor:string=""
    public Urgente: boolean = false
    public Comentarios: any[] = new Array();


    ProductosParaRequisicion: ProductosRequisicion[] = new Array()             //Array de productos

    setData(data: any){

        // this.FechaNotificacionUniformes = data.FechaNotificacionUniformes;


        this.IdRequisicionCompra = data.IdRequisicionCompra;
        this.Fecha = data.Fecha;
        this.FechaValor = data.FechaValor;
        this.AreaSolicitante = data.AreaSolicitante;
        this.Solicitante = data.Solicitante;
        this.NombreResponsable = data.NombreResponsable;
        this.Justificacion = data.Justificacion;
        this.Comprobante = data.Comprobante;
        this.Cotizacion = data.Cotizacion;
        this.ProductosParaRequisicion = data.ProductosParaRequisicion;
        this.CostoTotal = data.CostoTotal;
        this.Estatus = data.Estatus;
        this.Folio = data.Folio;    
        this.FolioValor = data.FolioValor; 
        this.Comentarios = data.Comentarios;
        this.Urgente = data.Urgente;
}

}

export class OrdendeCompra {
    public IdOrdendeCompra: string = "";
    public MetododePago: string = "";
    public Proveedor: string = "";
    public Fecha: string = "";
    public FechaValor: number = 0;
    public AreaSolicitante: string = "";
    public Solicitante: string = "";
    public NombreResponsable: string = "Ing. Carlos Guzman";
    public Justificacion: string = "";
    public Comprobante: string[] = new Array();
    public Cotizacion: string[] = new Array();
    public CostoTotal: number = 0;
    public Estatus: string = "";
    public Folio: string = "";
    public FolioValor: string = "";
    public Comentarios: any[] = new Array();
  
    // Agrega la propiedad ProductosParaRequisicion
    ProductosParaRequisicion: ProductosRequisicion[] = new Array()   


  
    setData(data: any) {
      this.IdOrdendeCompra = data.IdOrdendeCompra;
      this.MetododePago = data.MetododePago;
      this.Proveedor = data.Proveedor;
      this.Fecha = data.Fecha;
      this.FechaValor = data.FechaValor;
      this.AreaSolicitante = data.AreaSolicitante;
      this.Solicitante = data.Solicitante;
      this.NombreResponsable = data.NombreResponsable;
      this.ProductosParaRequisicion = data.ProductosParaRequisicion;
      this.Justificacion = data.Justificacion;
      this.Comprobante = data.Comprobante;
      this.Cotizacion = data.Cotizacion;
      this.CostoTotal = data.CostoTotal;
      this.Estatus = data.Estatus;
      this.Folio = data.Folio;
      this.FolioValor = data.FolioValor;
      this.Comentarios = data.Comentarios;
    }
  }
  




export class Proveedor{

    public IdProveedor:string=""
    public Nombre:string=""
    public RazonSocial:string=""
    public RFC:string=""
    public Telefono:string=""
    public CLABE:string=""
    public MetodoPago:string=""
    public Direccion:string=""

    setData(data: any){
        this.IdProveedor = data.IdProveedor;
        this.Nombre = data.Nombre;
        this.RazonSocial = data.RazonSocial;
        this.RFC = data.RFC;
        this.Telefono = data.Telefono;
        this.CLABE = data.CLABE;
        this.MetodoPago = data.MetodoPago;
        this.Direccion = data.Direccion;
    }
}

export class NuevoProducto{

    public IdNuevoProducto:string=""              //Id del catálogo 
    public Nombre:string=""                 //Nombre del articulo
    public Unidad:string=""                //cm, litros, etc
    public CantidadNecesaria:string=""   //--
    public CantidadProducto:string=""              
    public Descripcion:string=""            //Campo para especificar el articulo
    public Precio:string=""                 //Lo que cuesta
    public Motivo:string=""                 //---
    public Categoria:string=""              //Categoria a la que pertenece
    public Marca:string=""
    public Estatus:string=""
    public FechaGeneracion:string=""                  //
    public FechaGeneracionvalor:number=0
    public FechaChecado:string=""
    public FechaPago:string=""
    public FechaPagovalor:number=0
    public Comprobante:string=""
    public FechaRecepcion:string=""
    public FechaRecepcionvalor:string=""

    Cotizaciones: Cotizacion[] = new Array()                            //Rutas de documento
    public Observaciones:string=""

    //Fecha checado string
    //Cantidad producto
    //FechaTentativa string
    //Fecha de pago string number
    //Archivo comprobante de pago
    //Fecha Recepcion string number

    setData(data: any){
        this.IdNuevoProducto = data.IdNuevoProducto;
        this.Nombre = data.Nombre;
        this.Unidad = data.Unidad;
        this.CantidadNecesaria = data.CantidadNecesaria;
        this.CantidadProducto = data.CantidadProducto;
        this.Descripcion = data.Descripcion;
        this.Precio = data.Precio;
        this.Motivo = data.Motivo;
        this.Categoria = data.Categoria;
        this.Marca = data.Marca;
        this.Estatus = data.Estatus;
        this.FechaGeneracion = data.FechaGeneracion;
        this.FechaGeneracionvalor = data.FechaGeneracionvalor;
        this.FechaChecado = data.FechaChecado;
        this.FechaPago = data.FechaPago;
        this.FechaPagovalor = data.FechaPagovalor;
        this.Comprobante = data.Comprobante;
        this.FechaRecepcion = data.FechaRecepcion;
        this.FechaRecepcionvalor = data.FechaRecepcionvalor;
    }
}

export class Cotizacion{

    public IdProveedor:string=""
    public Proveedor:string=""                 //Nombre del proveedor
    Archivo:string[]= new Array()                         //Rutas de documento
    public Precio:string=""                   //Precio
    public FechaTentativa:string=""           //FechaTentativa
    public Marca:string=""                     //Marca
    public CantidadProducto:string=""            //Cantidad producto
    public Aprobado:boolean=false                //Boolean aprobado
    public AprobacionDirectiva:boolean=true      //Boolean aprobacion directiva

    setData(data: any){
        this.IdProveedor = data.IdProveedor;
        this.Proveedor = data.Proveedor;
        this.Archivo = data.Archivo;
        this.Precio = data.Precio;
        this.FechaTentativa = data.FechaTentativa;
        this.Marca = data.Marca;
        this.CantidadProducto = data.CantidadProducto;
        this.Aprobado = data.Aprobado;
        this.AprobacionDirectiva = data.AprobacionDirectiva;
    }
}

export class Entrega{

    Producto: Inventario = new Inventario()             //Array de productos


    public IdEntrega:string=""
    public Fecha:string=""
    public FechaEntrega:string=""                          //Fecha en que se entrega 
    public FechaEntregaValor:number=0                          //Fecha en que se entrega 
    public Responsable:string=""                          //Responsable de la entrega
    public Recibe:string=""                              //Persona que lo recibe o que fue entregado
    public Cantidad:number=0;
    

    setData(data: any){
        this.IdEntrega = data.IdEntrega;
        this.Producto = data.Producto;
        this.Fecha = data.Fecha;
        this.FechaEntrega = data.FechaEntrega;
        this.FechaEntregaValor = data.FechaEntregaValor;
        this.Responsable = data.Responsable;
        this.Recibe = data.Recibe;
        this.Cantidad = data.Cantidad;
    }
}
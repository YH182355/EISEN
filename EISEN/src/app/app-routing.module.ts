import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RequisicionesComponent } from './EISEN/Requisiciones/Requisiciones';
import { LoginComponent } from './EISEN/Login/Login';
import { InventarioComponent } from './EISEN/Inventario/Inventario';
import { NavbarComponent } from './EISEN/NavBar/Navbar';
import { ProductosComponent } from './EISEN/Productos/Productos';
import { ProveedorComponent } from './EISEN/Proveedores/Proveedor';
import { NuevaRequisicionComponent } from './EISEN/NuevaRequisicion/NuevaRequisicion';
import { EntregasComp } from './EISEN/Entregas/Entregas';
import { VistaRequisicionComponent } from './EISEN/VistaRequisicion/VistaRequisicion';
import { NuevoProductoComponent } from './EISEN/NuevoProducto/NuevoProducto';
import { PantallaAprobar } from './EISEN/PantallaM/PantallaAprobar';
import { RequisicioncompraComponent } from './EISEN/Pantalla_Beto/Requisicion-compra';
import { PagosComponent } from './EISEN/PantallaPagos/Pagos';
import { HistorialComponent } from './EISEN/HistorialRequisiciones/HistorialRequisiciones';
import { RequisicionRecibidaComponent } from './EISEN/RequisicionRecibida/RequisicionRecibida';
import { OrdenCompraComponent } from './EISEN/OrdendeCompra/OrdenCompra';
import { OrdenesComponent } from './EISEN/Ordenes/Ordenes';
import { AprobarOrdenComponent } from './EISEN/AprobarOrden/AprobarOrden';
import { PagoOrdenComponent } from './EISEN/PagoOrden/PagoOrden';
import { preaprobadaComponent } from './EISEN/preaprobada/preaprobada';


const routes: Routes = [
  {path:"Requisiciones", component:RequisicionesComponent},
  {path:"Login", component:LoginComponent},
  {path:"Inventario", component:InventarioComponent},
  {path:"Navbar", component:NavbarComponent},
  {path:"Productos", component:ProductosComponent},
  {path:"Proveedor", component:ProveedorComponent},
  {path:"NuevaRequisicion", component:NuevaRequisicionComponent},
  {path:"Entregas", component:EntregasComp},
  {path:"VistaRequisicion", component:VistaRequisicionComponent},
  {path:"NuevoProducto", component:NuevoProductoComponent},
  {path:"PantallaAprobar", component:PantallaAprobar},
  {path:"Requisicion-compra", component:RequisicioncompraComponent},
  {path:"Pagos", component:PagosComponent},
  {path:"Historial", component:HistorialComponent},
  {path:"Requisicion", component:RequisicionRecibidaComponent},
  {path:"OrdenCompra", component:OrdenCompraComponent},
  {path:"Ordenes", component:OrdenesComponent},
  {path:"AprobarOrden", component:AprobarOrdenComponent},
  {path:"PagoOrden", component:PagoOrdenComponent},
  {path:"preaprobada", component:preaprobadaComponent},
  {path: "**", redirectTo: '/Login'},
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';

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

@NgModule({
  declarations: [
    AppComponent,
    RequisicionesComponent,
    LoginComponent,
    InventarioComponent,
    NavbarComponent,
    ProductosComponent,
    ProveedorComponent,
    NuevaRequisicionComponent,
    EntregasComp,
    VistaRequisicionComponent,
    NuevoProductoComponent,
    PantallaAprobar,
    RequisicioncompraComponent,
    PagosComponent,
    HistorialComponent,
    RequisicionRecibidaComponent,
    OrdenCompraComponent,
    OrdenesComponent,
    AprobarOrdenComponent,
    PagoOrdenComponent,
    preaprobadaComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    FormsModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

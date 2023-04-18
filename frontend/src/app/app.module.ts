import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { HttpClientModule } from "@angular/common/http";
import { ComponetsModule } from "./componets/componets.module";
import { SharedModule } from "./shared/shared.module";
import { RouterModule, Routes } from "@angular/router";
import { LandingWithoutMetamaskComponent } from './adminPages/landing-without-metamask/landing-without-metamask.component';
import { AdminComponent } from "./adminPages/admin/admin.component";
import { IsLoginGuard } from "./guards/is-login.guard";
import { IsMetamskGuard } from "./guards/is-metamsk.guard";


const routes: Routes = [
    {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
    },
    {
        path: 'notconnected',
        component: LandingWithoutMetamaskComponent,
    },
    {
        path: 'signup',
        component: SignUpComponent,
    },
    {
        path: '',
        component: AdminComponent,
        canActivate: [IsLoginGuard, IsMetamskGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('./adminPages/admin/admin.module').then(m => m.AdminModule)
            }
        ]
    }
];

@NgModule({
    declarations: [
        AppComponent,
        AdminComponent,
        ToolbarComponent,
        SignUpComponent,
        LandingWithoutMetamaskComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        MaterialModule,
        HttpClientModule,
        MaterialModule,
        ComponetsModule,
        SharedModule
    ],
    exports: [RouterModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

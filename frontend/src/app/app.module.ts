import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "./shared/shared.module";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ComponentsModule } from "./components/components.module";
import { PagesComponent } from "./pages/pages/pages.component";

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'landing' },
    {
        path: 'signup',
        component: SignUpComponent,
    },
    {
        path: 'landing',
        loadChildren: () =>
            import('../app/pages/landing-with-metamask/landing-with-metamask.module').then(m => m.LandingWithMetamaskModule)
    },
    {
        path: '',
        loadChildren: () => import('./pages/pages/pages.module').then(m => m.PagesModule)
    },

];



@NgModule({
    declarations: [
        AppComponent,
        PagesComponent,
        ToolbarComponent,
        SignUpComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        MaterialModule,
        HttpClientModule,
        MaterialModule,
        ComponentsModule,
        SharedModule
    ],
    exports: [RouterModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

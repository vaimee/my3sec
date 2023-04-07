import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { AuthGuard } from "./auth/auth.guard";
import { RegisterComponent } from "./auth/register/register.component";
import { MainLayoutComponent } from "./layouts/main-layout/main-layout.component";


const routes: Routes = [
	{
		path: '',
		redirectTo: 'profile',
		pathMatch: 'full',
	},
	{
		path: 'login', component: LoginComponent, canActivate: [AuthGuard]
	},
	{
		path: 'sign-up', component: RegisterComponent
	},
	{
		path: '',
		component: MainLayoutComponent,
		loadChildren: () =>
			import('./layouts/main-layout/main-layout.module').then((m) => m.MainLayoutModule),
	},
	{ path: '**', redirectTo: 'error/404' }
]

@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		RouterModule.forRoot(routes, { useHash: true })
	],
	exports: [
	],
})
export class AppRoutingModule { }

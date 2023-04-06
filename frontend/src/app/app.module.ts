import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ComponetsModule } from "./componets/componets.module";
import { SharedModule } from "./shared/shared.module";
import { SharedService } from "./shared/shared.service";
import { AuthService } from "./auth/auth.service";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthInterceptor } from "./auth/auth.interceptor";
import { ErrorsHandlerService } from "./shared/error-handler";
import { MainLayoutComponent } from "./layouts/main-layout/main-layout.component";
import { AppRoutingModule } from "./app.routing";
import { RouterModule } from "@angular/router";


@NgModule({
	declarations: [
		AppComponent,
		MainLayoutComponent,
		ToolbarComponent,
		LoginComponent,
		RegisterComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		RouterModule,
		AppRoutingModule,
		HttpClientModule,
		MaterialModule,
		ComponetsModule,
		SharedModule

	],
	providers: [SharedService, AuthService, {
		provide: HTTP_INTERCEPTORS,
		useClass: AuthInterceptor,
		multi: true
	},
		{
			provide: ErrorHandler,
			useClass: ErrorsHandlerService
		}],
	bootstrap: [AppComponent]
})
export class AppModule { }

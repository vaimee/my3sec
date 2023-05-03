import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MaterialModule } from './material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { IsMetamaskGuard } from './guards/metamask.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'landing',
    loadChildren: () =>
      import('../app/landing-metamask/landing-metamask.module').then(
        (m) => m.LandingMetamaskModule
      ),
  },
  {
    canActivate: [IsMetamaskGuard],
    path: 'profile',
    loadChildren: () =>
      import('../app/user-profile/user-profile.module').then(
        (m) => m.UserProfileModule
      ),
  },
];

@NgModule({
  declarations: [AppComponent, SignUpComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes, { useHash: true }),
    MaterialModule,
    HttpClientModule,
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

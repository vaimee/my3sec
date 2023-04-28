import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingWithMetamaskComponent } from './landing-with-metamask.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LandingWithMetamaskComponent,
  }
];

@NgModule({
  declarations: [
    LandingWithMetamaskComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class LandingWithMetamaskModule { }

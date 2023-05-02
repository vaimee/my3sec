import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingMetamaskComponent } from './landing-metamask.component';

const routes: Routes = [
  { path: '', component: LandingMetamaskComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingMetamaskRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingMetamaskRoutingModule } from './landing-metamask-routing.module';
import { LandingMetamaskComponent } from './landing-metamask.component';


@NgModule({
  declarations: [
    LandingMetamaskComponent
  ],
  imports: [
    CommonModule,
    LandingMetamaskRoutingModule
  ]
})
export class LandingMetamaskModule { }

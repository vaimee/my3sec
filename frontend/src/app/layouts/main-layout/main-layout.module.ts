import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { MainLayoutRoutes } from './main-layout.routing';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(MainLayoutRoutes),
    SharedModule
  ]
})
export class MainLayoutModule { }

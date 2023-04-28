import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { IsMetamaskGuard } from 'app/guards/metaMask.guard';


const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [IsMetamaskGuard],
    children: [
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class PagesModule { }

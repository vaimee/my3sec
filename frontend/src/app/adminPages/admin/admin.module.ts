import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { IsLoginGuard } from 'app/guards/is-login.guard';
import { IsMetamskGuard } from 'app/guards/is-metamsk.guard';

const routes: Routes = [
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule), canActivate: [IsLoginGuard, IsMetamskGuard] },
  { path: '**', redirectTo: '/profile', pathMatch: 'full' },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class AdminModule { }

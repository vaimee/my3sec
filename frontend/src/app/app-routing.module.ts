import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { metamaskNotInstalledGuard } from './authentication/guards/metamask-not-installed.guard';
import { metamaskLoginGuard } from './authentication/guards/metamask-login.guard';
import { rightChainGuard } from './authentication/guards/right-chain.guard';
import { my3secLoginGuard } from './authentication/guards/my3sec-login.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'profile' },
  {
    path: 'auth',
    loadChildren: () =>
      import('../app/authentication/auth.module').then((m) => m.AuthModule),
  },
  {
    canActivateChild: [
      metamaskNotInstalledGuard,
      metamaskLoginGuard,
      rightChainGuard,
    ],
    children: [
      {
        path: '',
        canActivateChild: [my3secLoginGuard],
        loadChildren: () =>
          import('../app/user-profile/user-profile.module').then(
            (m) => m.UserProfileModule
          ),
      },
    ],
    path: 'profile',
  },
  { path: '**', redirectTo: 'profile' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

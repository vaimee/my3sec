import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetamaskLoginComponent } from './components/metamask-login/metamask-login.component';
import { WrongChainComponent } from './components/wrong-chain/wrong-chain.component';
import { MetamaskNotInstalledComponent } from './components/metamask-not-installed/metamask-not-installed.component';
import { metamaskNotInstalledGuard } from './guards/metamask-not-installed.guard';
import { rightChainGuard } from './guards/right-chain.guard';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { metamaskLoginGuard } from './guards/metamask-login.guard';

const routes: Routes = [
  { path: 'metamask-not-installed', component: MetamaskNotInstalledComponent },
  {
    canActivate: [metamaskNotInstalledGuard],
    path: 'login',
    component: MetamaskLoginComponent,
  },
  {
    canActivate: [metamaskNotInstalledGuard, metamaskLoginGuard],
    path: 'wrong-chain',
    component: WrongChainComponent,
  },
  {
    canActivate: [
      metamaskNotInstalledGuard,
      metamaskLoginGuard,
      rightChainGuard,
    ],
    path: 'signup',
    component: SignUpComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}

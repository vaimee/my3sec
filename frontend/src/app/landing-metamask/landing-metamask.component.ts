import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IMetamaskError, MetamaskService } from './services/metamask.service';


@Component({
  selector: 'app-landing-metamask',
  templateUrl: './landing-metamask.component.html',
  styleUrls: ['./landing-metamask.component.css']
})
export class LandingMetamaskComponent implements OnInit {

  constructor(private metamaskId: MetamaskService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  async ngOnInit(): Promise<void> {
    await this.metamaskId.isReady;
    this.checkRedirectCondition();
  }

  public get isMetamaskInstalled(): boolean {
    return this.metamaskId.isMetamaskInstalled;
  }

  public get isLoggedIn(): boolean {
    return this.metamaskId.isLoggedIn;
  }

  public get isVivianiChain(): boolean {
    return this.metamaskId.isVivianiChain;
  }

  public async loginToMetamask(): Promise<void> {
    try {
      await this.metamaskId.loginToMetamask();
      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;
      this.snackBar.open(metamaskError.message, 'Dismiss', {
        duration: 3000,
      });
    }

  }

  public async switchToViviani(): Promise<void> {
    try {
      await this.metamaskId.switchToVivianiChain();

      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;
      if (metamaskError.code === 4902) {
        // This error code indicates that the chain has not been added to MetaMask.
        try {
          await this.metamaskId.addVivianiChain();

          this.checkRedirectCondition();
        } catch (error: unknown) {
          const metamaskError = error as IMetamaskError;
          this.snackBar.open(metamaskError.message, 'Dismiss', {
            duration: 3000,
          });
        }
      } else {
        this.snackBar.open(metamaskError.message, 'Dismiss', {
          duration: 3000,
        });
      }
    }
  }

  private checkRedirectCondition(): void {
    if (
      this.metamaskId.isMetamaskInstalled &&
      this.metamaskId.isLoggedIn &&
      this.metamaskId.isVivianiChain
    ) {

      // There's no reason to display this page:
      // let's move to the application's home.
      this.router.navigate(['/profile']);
    }
  }

  public async signUp() {
    this.router.navigate(['/signup'])
  }
}

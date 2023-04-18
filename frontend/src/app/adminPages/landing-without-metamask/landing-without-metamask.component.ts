import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IMetamaskError, MetaMaskService } from 'app/services/meta-mask.service';


@Component({
  selector: 'app-landing-without-metamask',
  templateUrl: './landing-without-metamask.component.html',
  styleUrls: ['./landing-without-metamask.component.css']
})
export class LandingWithoutMetamaskComponent implements OnInit {

  constructor(
    private metaMaskId: MetaMaskService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  async ngOnInit(): Promise<void> {
    this.checkRedirectCondition();
  }

  public get isMetamaskInstalled(): boolean {
    return this.metaMaskId.isMetamaskInstalled;
  }

  public get isLoggedIn(): boolean {
    return this.metaMaskId.isLoggedIn;
  }

  public async loginToMetamask(): Promise<void> {
    try {
      await this.metaMaskId.loginToMetamask();

      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;
      this.snackBar.open(metamaskError.message, 'Dismiss', {
        duration: 3000,
      });
    }
  }

  public async signUp() {
    this.router.navigate(['/signup'])
  }

  public async switchToViviani(): Promise<void> {
    try {
      await this.metaMaskId.switchToVivianiChain();

      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;

      if (metamaskError.code === 4902) {
        // This error code indicates that the chain has not been added to MetaMask.
        try {
          await this.metaMaskId.addVivianiChain();

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
      this.metaMaskId.isMetamaskInstalled &&
      this.metaMaskId.isLoggedIn
    ) {
      // There's no reason to display this page:
      // let's move to the application's home.
      this.router.navigate(['/']);
    }
  }



}





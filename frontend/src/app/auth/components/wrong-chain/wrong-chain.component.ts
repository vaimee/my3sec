import { Component, OnInit } from '@angular/core';
import { MetamaskError } from './../../../shared/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MetamaskService } from './../../services/metamask.service';

@Component({
  selector: 'app-wrong-chain',
  templateUrl: './wrong-chain.component.html',
  styleUrls: ['./wrong-chain.component.css', '../../shared/styles.css'],
})
export class WrongChainComponent implements OnInit {
  constructor(
    private metamaskService: MetamaskService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkRedirectCondition();
  }

  public async switchToViviani(): Promise<void> {
    this.checkRedirectCondition();
    try {
      await this.metamaskService.switchToVivianiChain();
      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as MetamaskError;
      if (metamaskError.code === 4902) {
        // This error code indicates that the chain has not been added to metamaskService
        try {
          await this.metamaskService.addVivianiChain();

          this.checkRedirectCondition();
        } catch (error: unknown) {
          const metamaskError = error as MetamaskError;
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
    if (!this.metamaskService.isVivianiChain) return;
    this.router.navigate(['/profile']);
  }
}

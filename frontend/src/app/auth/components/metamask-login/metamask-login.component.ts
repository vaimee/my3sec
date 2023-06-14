import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MetamaskService } from '../../services/metamask.service';
import { MetamaskError } from './../../../shared/interfaces';

@Component({
  selector: 'app-metamask-login',
  templateUrl: './metamask-login.component.html',
  styleUrls: ['./metamask-login.component.css', '../../shared/styles.css'],
})
export class MetamaskLoginComponent implements OnInit {
  constructor(private metamaskService: MetamaskService, private snackBar: MatSnackBar, private router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.metamaskService.isReady;
    this.checkRedirectCondition();
  }

  public async loginToMetamask(): Promise<void> {
    try {
      await this.metamaskService.loginToMetamask();
      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as MetamaskError;
      this.snackBar.open(metamaskError.message, 'Dismiss', {
        duration: 3000,
      });
    }
  }

  private checkRedirectCondition(): void {
    if (!this.metamaskService.isLoggedIn) return;
    this.router.navigate(['/profiles']);
  }
}

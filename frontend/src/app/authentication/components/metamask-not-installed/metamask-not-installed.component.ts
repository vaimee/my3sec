import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MetamaskService } from 'app/authentication/services/metamask.service';

@Component({
  selector: 'app-metamask-not-installed',
  templateUrl: './metamask-not-installed.component.html',
  styleUrls: [
    './metamask-not-installed.component.css',
    '../../shared/styles.css',
  ],
})
export class MetamaskNotInstalledComponent implements OnInit {
  constructor(private metamask: MetamaskService, private router: Router) {}

  ngOnInit(): void {
    if (!this.metamask.isMetamaskInstalled) return;
    this.router.navigate(['/profile']);
  }
}

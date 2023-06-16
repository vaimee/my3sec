import { Observable, map, merge, mergeMap } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MetamaskService } from '@auth/services/metamask.service';

import { Profile } from '@shared/interfaces';
import { EnergyWalletContractService } from '@shared/services/energy-wallet-contract.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { ProfileService } from '@shared/services/profile.service';

import { SearchBarCategory } from '../../models/search-bar-category.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  totalEnergy!: Observable<number>;
  freeEnergy!: Observable<number>;
  profile!: Profile;
  SearchBarCategory = SearchBarCategory;
  searchForm = this.formBuilder.group({
    searchText: ['', Validators.required],
    category: SearchBarCategory.PROFILE,
  });
  isSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private profileService: ProfileService,
    private my3secHubService: My3secHubContractService,
    private energyWallet: EnergyWalletContractService,
    private metaMaskService: MetamaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const address = this.metaMaskService.userAddress;
    this.profileService.getDefaultProfile(address).subscribe(profile => {
      this.totalEnergy = this.energyWallet.totalEnergyOf(parseInt(profile.id));
      this.freeEnergy = this.energyWallet.freeEnergyOf(parseInt(profile.id));
      this.profile = profile;
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.snackBar.open('Search input cannot be empty', 'Dismiss', {
        duration: 3000,
        verticalPosition: 'top',
      });
      return;
    }
    const searchForm = this.searchForm.value;
    console.log('Search value:', searchForm.searchText);
    console.log('Selected option:', searchForm.category);
    this.isSubmitted = true;
  }

  redirectToProfile() {
    console.log('redirect to profile home');
    this.router.navigate(['/profiles/me']);
  }
}

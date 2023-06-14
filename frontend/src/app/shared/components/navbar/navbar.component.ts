import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SearchBarCategory } from '../../models/search-bar-category.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { EnergyWalletContract } from '@shared/services/energy-wallet-contract.service';
import { Observable, map, merge, mergeMap } from 'rxjs';
import { MetamaskService } from '@auth/services/metamask.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit{
  totalEnergy!: Observable<number>;
  freeEnergy!: Observable<number>;
  SearchBarCategory = SearchBarCategory;
  searchForm = this.formBuilder.group({
    searchText: ['', Validators.required],
    category: SearchBarCategory.PROFILE,
  });
  isSubmitted = false;

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private my3secHubService: My3secHubContractService, private energyWallet: EnergyWalletContract,private metaMaskService: MetamaskService, private router: Router) { }
  
  ngOnInit(): void {
    const address = this.metaMaskService.userAddress
    this.my3secHubService.getDefaultProfile(address).pipe(
      map((profile) => profile.id.toNumber()),
    ).subscribe(async (id) => {
      this.totalEnergy = this.energyWallet.totalEnergyOf(id);
      this.freeEnergy = this.energyWallet.freeEnergyOf(id);
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
    this.router.navigate(['/profile']);
  }
}

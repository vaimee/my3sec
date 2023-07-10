import { Observable, map, merge, mergeMap } from 'rxjs';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MetamaskService } from '@auth/services/metamask.service';

import { Profile } from '@shared/interfaces';
import { EnergyWalletContractService } from '@shared/services/energy-wallet-contract.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { NavbarService } from '@shared/services/navbar.services';
import { ProfileService } from '@shared/services/profile.service';

import { MenuItem } from '../../interfaces/menu-item.interface';
import { SearchBarCategory } from '../../models/search-bar-category.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Output() menuItemClicked: EventEmitter<MenuItem> = new EventEmitter<MenuItem>();

  totalEnergy!: Observable<number>;
  freeEnergy!: Observable<number>;
  profile$!: Observable<Profile>;
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
    private navBarService: NavbarService,
    private energyWallet: EnergyWalletContractService,
    private metaMaskService: MetamaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const address = this.metaMaskService.userAddress;
    this.profile$ = this.profileService.getDefaultProfile(address);
    this.profile$.subscribe(profile => {
      this.totalEnergy = this.energyWallet.totalEnergyOf(parseInt(profile.id));
      this.freeEnergy = this.energyWallet.freeEnergyOf(parseInt(profile.id));
    });
    this.navBarService.getMenuItems().subscribe(menuItems => {
      this.menuItems = menuItems;
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
    this.router.navigate(['/profiles/me']);
  }

  redirectToCreateOrganization() {
    this.router.navigate(['/organizations/new']);
  }

  redirectToLogHours() {
    this.router.navigate(['/profiles/log-hours']);
  }

  redirectToExplore() {
    this.router.navigate(['/explore']);
  }

  handleItemClick(item: MenuItem): void {
    this.menuItemClicked.emit(item);
    this.navBarService.fireMenuClickedEvent(item);
  }
}

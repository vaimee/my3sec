import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { SearchBarCategory } from 'app/user-profile/models';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css'],
})
export class ProfileHeaderComponent {
  SearchBarCategory = SearchBarCategory;
  searchForm = this.formBuilder.group({
    searchText: ['', Validators.required],
    category: SearchBarCategory.PROFILE,
  });
  isSubmitted = false;

  constructor(
    private my3secHubContractService: My3secHubContractService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

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
}

import { Observable, catchError, finalize, map, of, switchMap } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MetamaskService } from '@auth/services/metamask.service';

import { ImageConversionService } from '@shared/services/image-conversion.service';
import { IpfsService } from '@shared/services/ipfs.service';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit, OnDestroy {
  signUpForm!: FormGroup;
  submitted = false;
  profileExists$!: Observable<boolean>;
  base64Image = '';
  constructor(
    private formBuilder: FormBuilder,
    private my3secHubContractService: My3secHubContractService,
    private ipfsService: IpfsService,
    private metamaskService: MetamaskService,
    private imageConversionService: ImageConversionService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();

    this.profileExists$ = this.my3secHubContractService.getDefaultProfile(this.metamaskService.userAddress).pipe(
      map(value => {
        if (value === undefined) return false;
        return true;
      }),
      catchError(error => {
        this.loadingService.hide();
        console.log('error when reading profile - redirect to signup', error);
        return of(false);
      })
    );
  }

  loadForm() {
    this.signUpForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      surname: ['', Validators.compose([Validators.required])],
      bio: ['', Validators.compose([Validators.maxLength(150)])],
      profileImage: [null, Validators.compose([Validators.required])],
      regulationCheckbox: [false, Validators.requiredTrue],
    });
  }

  get profileImage() {
    return this.signUpForm.get('profileImage');
  }

  get regulationCheckbox() {
    return this.signUpForm.get('regulationCheckbox');
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.signUpForm.valid) return;

    if (this.base64Image === '') return;
    const formValue = { ...this.signUpForm.value };
    formValue.profileImage = this.base64Image;
    this.loadingService.show();

    this.ipfsService
      .storeJSON(formValue)
      .pipe(switchMap(uri => this.my3secHubContractService.createProfile(uri)))
      .subscribe({
        next: value => {
          this.loadingService.hide();
          console.log(`Profile created with ID: ${value}`);
          this.router.navigate(['/profiles']);
        },
        error: err => {
          this.loadingService.hide();
          console.error(`Failed to create profile: ${err}`);
        },
      });
  }

  async onFileSelected(fileInputEvent: Event, label: HTMLDivElement): Promise<void> {
    const fileInput = fileInputEvent.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (file === null) return;
    this.base64Image = await this.imageConversionService.convertImageToBase64(file);
    label.innerText = file.name;
  }

  reset() {
    this.submitted = false;
  }
  public formError = (controlName: string, errorName: string) =>
    this.signUpForm.controls[controlName].hasError(errorName);
}

import { ImageConversionService } from './../../../shared/services/image-conversion.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MetamaskService } from 'app/authentication/services/metamask.service';
import { IpfsService } from 'app/shared/services/ipfs.service';
import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

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
    private router: Router
  ) {}

  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();

    this.profileExists$ = this.my3secHubContractService
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(
        map((value) => {
          if (value === undefined) return false;
          return true;
        }),
        catchError((error) => {
          console.error(error);
          console.log('error when reading profile - redirect to signup');
          return of(false);
        })
      );
  }

  loadForm() {
    this.signUpForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      surname: ['', Validators.compose([Validators.required])],
      organization: ['', Validators.compose([Validators.required])],
      role: ['', Validators.compose([Validators.required])],
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

    this.ipfsService
      .storeJSON(formValue)
      .pipe(
        switchMap((uri) => this.my3secHubContractService.createProfile(uri))
      )
      .subscribe({
        next: (value) => {
          console.log(`Profile created with ID: ${value}`);
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.error(`Failed to create profile: ${err}`);
        },
      });
  }

  async onFileSelected(
    fileInputEvent: Event,
    label: HTMLDivElement
  ): Promise<void> {
    const fileInput = fileInputEvent.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (file === null) return;
    this.base64Image = await this.imageConversionService.convertImageToBase64(
      file
    );
    label.innerText = file.name;
  }

  reset() {
    this.submitted = false;
  }
  public formError = (controlName: string, errorName: string) =>
    this.signUpForm.controls[controlName].hasError(errorName);
}

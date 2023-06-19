import { Observable, catchError, finalize, map, of, switchMap } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ImageConversionService } from '@shared/services/image-conversion.service';
import { IpfsService } from '@shared/services/ipfs.service';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.css'],
})
export class CreateOrganizationComponent implements OnInit, OnDestroy {
  signUpForm!: FormGroup;
  submitted = false;
  base64Image = '';
  constructor(
    private formBuilder: FormBuilder,
    private my3secHubContractService: My3secHubContractService,
    private ipfsService: IpfsService,
    private imageConversionService: ImageConversionService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.signUpForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
      organizationIcon: [null, Validators.compose([Validators.required])],
    });
  }

  get organizationIcon() {
    return this.signUpForm.get('organizationIcon');
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.signUpForm.valid) return;

    if (this.base64Image === '') return;
    const formValue = { ...this.signUpForm.value };
    formValue.organizationIcon = this.base64Image;
    this.loadingService.show();
    this.ipfsService
      .storeJSON(formValue)
      // TODO: create organization
      .subscribe();
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
  public formError = (controlName: string, errorName: string) =>{
    console.log(controlName, errorName);
    
    return this.signUpForm.controls[controlName].hasError(errorName);
  }
}

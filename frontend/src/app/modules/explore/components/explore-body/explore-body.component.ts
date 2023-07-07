import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { OrganizationMetadata } from '@shared/interfaces';
import { ImageConversionService } from '@shared/services/image-conversion.service';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-explore-body',
  templateUrl: './explore-body.component.html',
  styleUrls: ['./explore-body.component.css'],
})
export class ExploreBodyComponent implements OnInit, OnDestroy {
  signUpForm!: FormGroup;
  submitted = false;
  base64Image = '';
  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
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
      headline: ['', Validators.compose([Validators.required])],
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
    const formValue: OrganizationMetadata = { ...this.signUpForm.value };
    formValue.icon = this.base64Image;
    this.loadingService.show();
    this.organizationService.createOrganization(formValue).subscribe({
      next: address => {
        this.loadingService.hide();
        this.router.navigate(['organizations', address]);
      },
      error: err => {
        this.loadingService.hide();
        console.error(`Failed to create organization`);
        console.error(err);
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

  public formError = (controlName: string, errorName: string) => {
    return this.signUpForm.controls[controlName].hasError(errorName);
  };
}

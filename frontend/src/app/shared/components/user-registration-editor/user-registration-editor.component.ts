import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { ProfileMetadata } from '@shared/interfaces';
import { ImageConversionService } from '@shared/services/image-conversion.service';
import { LoadingService } from '@shared/services/loading.service';
import { ProfileService } from '@shared/services/profile.service';

@Component({
  selector: 'app-user-registration-editor',
  templateUrl: './user-registration-editor.component.html',
  styleUrls: ['./user-registration-editor.component.css'],
})
export class UserRegistrationEditorComponent implements OnInit, OnDestroy {
  @Input() profileId!: string;
  @Input() profileMetadata: ProfileMetadata = {
    firstName: '',
    surname: '',
    bio: '',
    profileImage: '',
  };
  @Output() profileCreated: EventEmitter<number> = new EventEmitter<number>();
  @Output() profileUpdated: EventEmitter<string> = new EventEmitter<string>();

  isSignIn!: boolean;
  signUpForm!: FormGroup;
  submitted = false;
  base64Image = '';
  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private imageConversionService: ImageConversionService,
    private loadingService: LoadingService
  ) {}

  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.isSignIn = this.profileId === undefined;
    if (!this.isSignIn) this.base64Image = this.profileMetadata.profileImage;
    this.loadForm();
  }

  loadForm() {
    const group: { [key: string]: (string | boolean | ValidatorFn | null | undefined)[] } = {
      firstName: [this.profileMetadata.firstName, Validators.compose([Validators.required])],
      surname: [this.profileMetadata.surname, Validators.compose([Validators.required])],
      bio: [this.profileMetadata.bio, Validators.compose([Validators.maxLength(150)])],
      profileImage: [null],
    };
    if (this.isSignIn) {
      group['profileImage'].push(Validators.required);
      group['regulationCheckbox'] = [false, Validators.requiredTrue];
    }
    this.signUpForm = this.formBuilder.group(group);
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
    const profileMetadata: ProfileMetadata = {
      firstName: this.signUpForm.value.firstName,
      surname: this.signUpForm.value.surname,
      profileImage: this.base64Image,
    };
    if (this.signUpForm.value.bio) profileMetadata.bio = this.signUpForm.value.bio;
    profileMetadata.profileImage = this.base64Image;
    this.loadingService.show();

    if (this.isSignIn) {
      this.profileService.createProfile(profileMetadata).subscribe({
        next: profileId => {
          this.loadingService.hide();
          this.profileCreated.emit(profileId);
        },
        error: err => {
          this.loadingService.hide();
          console.error(`Failed to create profile: ${err}`);
        },
      });
    } else {
      this.profileService.updateProfile(parseInt(this.profileId), profileMetadata).subscribe({
        next: () => {
          this.loadingService.hide();
          this.profileUpdated.emit(this.profileId);
        },
        error: err => {
          this.loadingService.hide();
          console.error(`Failed to update profile: ${err}`);
        },
      });
    }
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

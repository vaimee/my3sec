import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  formGroup!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _my3secHub: My3secHubContractService
  ) {}

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.formGroup = this._formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      surname: ['', Validators.compose([Validators.required])],
      organization: ['', Validators.compose([Validators.required])],
      role: ['', Validators.compose([Validators.required])],
      cb: [false, Validators.requiredTrue],
    });
  }

  async onSubmit() {
    if (!this.formGroup.valid) return;
    //TODO: structure the uri passed
    this._my3secHub.createProfile(this.formGroup.value)
  }

  public myError = (controlName: string, errorName: string) => {
    return this.formGroup.controls[controlName].hasError(errorName);
  };
}

/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  formGroup!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadForm();
  }

  //Load form
  loadForm() {
    this.formGroup = this.fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      surName: ['', Validators.compose([Validators.required])],
      organization: ['', Validators.compose([Validators.required])],
      role: ['', Validators.compose([Validators.required])],
      cb: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      console.table(this.formGroup.value);
    }
  }

  // helpers for View
  public myError = (controlName: string, errorName: string) => {
    return this.formGroup.controls[controlName].hasError(errorName);
  }

  get f() { return this.formGroup.controls; }
}

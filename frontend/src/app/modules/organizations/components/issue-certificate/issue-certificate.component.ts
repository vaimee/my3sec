import { ChipInput } from 'app/modules/tasks/models';
import { Observable, map, startWith } from 'rxjs';

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

import { CertificateMetadata, Profile } from '@shared/interfaces';
import { CertificateService } from '@shared/services/certificate.service';
import { ImageConversionService } from '@shared/services/image-conversion.service';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-issue-certificate',
  templateUrl: './issue-certificate.component.html',
  styleUrls: ['./issue-certificate.component.css'],
})
export class IssueCertificateComponent implements OnInit, OnDestroy {
  @ViewChild('memberInput') memberTextInput!: ElementRef<HTMLInputElement>;

  issueCertificateForm!: FormGroup;
  organizationAddress: string;
  base64Image = '';
  memberChip!: ChipInput<Profile>;

  submitted = false;
  members$!: Observable<Profile[]>;
  constructor(
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private certificateService: CertificateService,
    private imageConversionService: ImageConversionService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.memberChip = new ChipInput<Profile>();
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }
  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();
    this.organizationService.setTarget(this.organizationAddress);
    this.memberChip.items$ = this.organizationService.getMembers();
    this.memberChip.items$.subscribe(members => {
      this.memberChip.all = members;
    });
  }
  reset() {
    this.submitted = false;
  }
  loadForm() {
    this.issueCertificateForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
      certificateIcon: [null, Validators.compose([Validators.required])],
      membersName: new FormControl(null, { validators: [this.required()], updateOn: 'change' }),
      memberInput: [null],
    });

    this.memberChip.filteredItems$ = this.memberInput.valueChanges.pipe(
      startWith(''),
      map(memberName => {
        if (typeof memberName !== 'string') return this.filter('');
        return this.filter(memberName);
      })
    );
  }

  required(): ValidatorFn {
    return (): ValidationErrors | null => {
      console.log(this.memberChip.selectedItems.length);
      return this.memberChip.selectedItems.length === 0 ? { emptyMembers: 'members cannot be empty' } : null;
    };
  }

  get certificateIcon() {
    return this.issueCertificateForm.get('certificateIcon');
  }

  get memberInput(): FormControl {
    return this.issueCertificateForm.get('memberInput') as FormControl;
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.issueCertificateForm.valid) return;
    if (this.base64Image === '') return;
    const certificateMetadata: CertificateMetadata = {
      name: this.issueCertificateForm.value.name,
      description: this.issueCertificateForm.value.description,
      image: this.base64Image,
    };
    for (const member of this.memberChip.selectedItems) {
      this.loadingService.show();
      this.certificateService
        .issueCertificate(this.organizationAddress, parseInt(member.id), certificateMetadata)
        .subscribe({
          next: () =>
            this.handleObservable(
              `Certificate ${certificateMetadata.name} issued to ${member.firstName} ${member.surname}`
            ),
          error: err =>
            this.handleObservable(
              `Failed to issue certificate ${certificateMetadata.name} to ${member.firstName} ${member.surname}`,
              err
            ),
        });
    }
  }

  public formError = (controlName: string, errorName: string) => {
    return this.issueCertificateForm.controls[controlName].hasError(errorName);
  };

  async onFileSelected(fileInputEvent: Event, label: HTMLDivElement): Promise<void> {
    const fileInput = fileInputEvent.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (file === null) return;
    this.base64Image = await this.imageConversionService.convertImageToBase64(file);
    label.innerText = file.name;
  }

  private handleObservable(message: string, err?: Error) {
    if (err) console.error(err);
    this.loadingService.hide();
    this.openSnack(message);
  }

  private openSnack(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }
  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.addMember(value);
    event.chipInput.clear();
    this.memberInput.setValue('');
  }

  public remove(memberToRemove: Profile): void {
    const index = this.memberChip.selectedItems.indexOf(memberToRemove);
    if (index >= 0) {
      this.memberChip.selectedItems.splice(index, 1);
      this.memberInput.setValue('');
    }
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    const memberName = event.option.viewValue;
    this.addMember(memberName);
    this.memberTextInput.nativeElement.value = '';
    this.memberInput.setValue('');
  }

  public getMemberName(member: Profile): string {
    return `${member.firstName} ${member.surname}`;
  }

  private addMember(memberName: string): Profile | null {
    const selectedMember = this.memberChip.all.find(
      member => memberName.toLowerCase() === this.getMemberName(member).toLowerCase()
    );
    if (!selectedMember) return null;
    if (this.memberChip.selectedItems.includes(selectedMember)) return null;
    this.memberChip.selectedItems.push(selectedMember);
    return selectedMember;
  }

  private filter(value: string): Profile[] {
    const matchingMembers = this.memberChip.all.filter(member => {
      const memberName = this.getMemberName(member).toLowerCase();
      return memberName.includes(value.toLowerCase());
    });
    return matchingMembers.filter(
      member => !this.memberChip.selectedItems.find((selectedMember: Profile) => selectedMember.id === member.id)
    );
  }
}

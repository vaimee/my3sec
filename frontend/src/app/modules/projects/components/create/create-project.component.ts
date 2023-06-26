import { Observable, finalize, map, startWith } from 'rxjs';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';

import { Profile, ProjectMetadata } from '@shared/interfaces';
import { ImageConversionService } from '@shared/services/image-conversion.service';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
})
export class CreateProjectComponent {
  @Input() allMembers: Profile[] = [
    {
      id: '5',
      firstName: 'Ivan',
      surname: 'Zyrianoff',
      organization: 'ABC Company',
      role: 'Developer',
      profileImage: '../../../assets/images/ivan.jpg',
      walletAddress: '0x1234567890abcdef',
      regulationCheckbox: true,
    },
    {
      id: '4',
      firstName: 'Lorenzo',
      surname: 'Gigli',
      organization: 'ABC Company',
      role: 'Developer',
      profileImage: '../../../assets/images/gigli.jpg',
      walletAddress: '0x1234567890abcdef',
      regulationCheckbox: true,
    },
  ];
  @ViewChild('memberInput') memberInput!: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredMembers: Observable<Profile[]>;
  selectedMembers: Profile[] = [];
  createProjectForm!: FormGroup;
  today = new Date();
  submitted = false;
  memberCtrl = new FormControl('');
  base64Image = '';

  constructor(
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private imageConversionService: ImageConversionService,
    private router: Router
  ) {
    this.filteredMembers = this.memberCtrl.valueChanges.pipe(
      startWith(null),
      map((memberName: string | null) => (memberName ? this.filter(memberName) : this.allMembers.slice()))
    );
  }

  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.createProjectForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
      headline: ['', Validators.compose([Validators.required])],
      projectIcon: null,
      start: [new FormControl<Date | null>(null), Validators.compose([Validators.required])],
      end: [new FormControl<Date | null>(null), Validators.compose([Validators.required])],
    });
  }

  get organizationIcon() {
    return this.createProjectForm.get('projectIcon');
  }

  async onSubmit() {
    this.submitted = true;

    if (!this.createProjectForm.valid) return;

    const formValue: ProjectMetadata = { ...this.createProjectForm.value };
    if (this.base64Image !== '') formValue.icon = this.base64Image;
    this.loadingService.show();
    this.organizationService.createProjectBlocking(formValue, this.selectedMembers);
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
    return this.createProjectForm.controls[controlName].hasError(errorName);
  };

  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.addMember(value);
    event.chipInput!.clear();
    this.memberCtrl.setValue(null);
  }

  public remove(memberToRemove: any): void {
    this.selectedMembers = this.selectedMembers.filter(member => member !== memberToRemove);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    const memberName = event.option.viewValue;
    this.addMember(memberName);
    this.memberInput.nativeElement.value = '';
    this.memberCtrl.setValue(null);
  }

  private addMember(memberName: string): Profile | null {
    const selectedMember = this.allMembers.find(member => memberName === this.getMemberName(member));
    if (!selectedMember) return null;
    if (this.selectedMembers.includes(selectedMember)) return null;
    this.selectedMembers.push(selectedMember);
    return selectedMember;
  }

  private filter(value: string): Profile[] {
    return this.allMembers.filter(member => this.getMemberName(member).includes(value));
  }

  public getMemberName(member: Profile): string {
    return `${member.firstName} ${member.surname}`;
  }
}

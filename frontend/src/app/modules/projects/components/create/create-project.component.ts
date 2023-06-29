import { Observable, map, startWith } from 'rxjs';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';

import { Profile, ProjectMetadata } from '@shared/interfaces';
import { ImageConversionService } from '@shared/services/image-conversion.service';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  @ViewChild('memberInput') memberTextInput!: ElementRef<HTMLInputElement>;
  allMembers!: Profile[];
  members$!: Observable<Profile[]>;
  createProjectForm!: FormGroup;
  organizationAddress: string;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredMembers$!: Observable<Profile[]>;
  selectedMembers: Profile[] = [];
  today = new Date();
  submitted = false;
  base64Image = '';

  constructor(
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private imageConversionService: ImageConversionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }

  ngOnDestroy() {
    this.submitted = false;
  }

  ngOnInit(): void {
    this.loadForm();
    this.organizationService.setTarget(this.organizationAddress);
    this.members$ = this.organizationService.getMembers();
    this.members$.subscribe(members => {
      this.allMembers = members;
    });
  }

  private loadForm() {
    this.createProjectForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      headline: new FormControl('', [Validators.required, Validators.minLength(10)]),
      projectIcon: null,
      start: new FormControl(null, [Validators.required]),
      end: new FormControl(null, [Validators.required]),
      membersName: new FormControl(null, [Validators.required]),
      memberInput: [null],
    });

    this.filteredMembers$ = this.memberInput.valueChanges.pipe(
      startWith(''),
      map(memberName => {
        if (typeof memberName !== 'string') return this.filter('');
        return this.filter(memberName);
      })
    );
  }

  get memberInput(): FormControl {
    return this.createProjectForm.get('memberInput') as FormControl;
  }

  get organizationIcon() {
    return this.createProjectForm.get('projectIcon');
  }

  public formError = (controlName: string, errorName: string) => {
    return this.createProjectForm.controls[controlName].hasError(errorName);
  };

  public onSubmit() {
    this.submitted = true;
    this.createProjectForm.markAllAsTouched();
    console.log(this.createProjectForm.value);

    if (!this.createProjectForm.valid) return;

    const formValue: ProjectMetadata = { ...this.createProjectForm.value };
    if (this.base64Image !== '') formValue.icon = this.base64Image;
    this.loadingService.show();

    this.organizationService.createProject(formValue, this.selectedMembers).subscribe({
      next: projectId => {
        this.loadingService.hide();
        this.router.navigate(['projects', projectId], { relativeTo: this.route });
      },
      error: err => {
        this.loadingService.hide();
        console.error(`Failed to create project`);
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

  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.addMember(value);
    event.chipInput.clear();
    this.memberInput.setValue('');
  }

  public remove(memberToRemove: Profile): void {
    const index = this.selectedMembers.indexOf(memberToRemove);
    if (index >= 0) {
      this.selectedMembers.splice(index, 1);
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
    const selectedMember = this.allMembers.find(
      member => memberName.toLowerCase() === this.getMemberName(member).toLowerCase()
    );
    if (!selectedMember) return null;
    if (this.selectedMembers.includes(selectedMember)) return null;
    this.selectedMembers.push(selectedMember);
    return selectedMember;
  }

  private filter(value: string): Profile[] {
    const matchingMembers = this.allMembers.filter(member => {
      const memberName = this.getMemberName(member).toLowerCase();
      return memberName.includes(value.toLowerCase());
    });
    return matchingMembers.filter(
      member => !this.selectedMembers.find((selectedMember: Profile) => selectedMember.id === member.id)
    );
  }
}

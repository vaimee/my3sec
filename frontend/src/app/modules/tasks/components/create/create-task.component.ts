import { map, of, startWith } from 'rxjs';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Profile, TaskMetadata } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';
import { SkillService } from '@shared/services/skill.service';

import { Skill } from '@profiles/interfaces';

import { ChipInput } from '../../models';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css'],
})
export class CreateTaskComponent implements OnInit, OnDestroy {
  @ViewChild('skillInput') skillTextInput!: ElementRef<HTMLInputElement>;
  @ViewChild('memberInput') memberTextInput!: ElementRef<HTMLInputElement>;
  skillChip!: ChipInput<Skill>;
  memberChip!: ChipInput<Profile>;
  createTaskForm!: FormGroup;
  organizationAddress: string;
  projectId: number;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  today = new Date();
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private skillService: SkillService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.skillChip = new ChipInput<Skill>();
    this.memberChip = new ChipInput<Profile>();
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnDestroy() {
    this.submitted = false;
  }

  ngOnInit(): void {
    this.loadForm();
    this.organizationService.setTarget(this.organizationAddress);
    this.skillChip.items$ = this.skillService.getSkills();
    this.memberChip.items$ = this.organizationService.getProjectMembers(this.projectId);

    this.skillChip.items$.subscribe(skills => {
      this.skillChip.all = skills;
    });
    this.memberChip.items$.subscribe(members => {
      this.memberChip.all = members;
    });
  }

  private loadForm() {
    this.createTaskForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      start: new FormControl(null, [Validators.required]),
      end: new FormControl(null, [Validators.required]),
      skillsName: new FormControl(null, [Validators.required]),
      skillInput: [null],
      membersName: new FormControl(null),
      memberInput: [null],
    });

    this.skillChip.filteredItems$ = this.skillInput.valueChanges.pipe(
      startWith(''),
      map(skillName => {
        if (typeof skillName !== 'string') return this.filterSkill('');
        return this.filterSkill(skillName);
      })
    );

    this.memberChip.filteredItems$ = this.memberInput.valueChanges.pipe(
      startWith(''),
      map(memberName => {
        if (typeof memberName !== 'string') return this.filterMember('');
        return this.filterMember(memberName);
      })
    );
  }

  get memberInput(): FormControl {
    return this.createTaskForm.get('memberInput') as FormControl;
  }

  get skillInput(): FormControl {
    return this.createTaskForm.get('skillInput') as FormControl;
  }

  public formError = (controlName: string, errorName: string) => {
    return this.createTaskForm.controls[controlName].hasError(errorName);
  };

  public onSubmit() {
    this.submitted = true;
    this.createTaskForm.markAllAsTouched();

    if (!this.createTaskForm.valid) return;

    const formValue: TaskMetadata = { ...this.createTaskForm.value };

    this.loadingService.show();

    const createTask$ =
      this.memberChip.selectedItems.length === 0
        ? this.organizationService.createTaskWithoutMembers(this.projectId, formValue, this.skillChip.selectedItems)
        : this.organizationService.createTask(
            this.projectId,
            formValue,
            this.skillChip.selectedItems,
            this.memberChip.selectedItems
          );

    createTask$.subscribe({
      next: taskId => {
        console.log('taskId', taskId);
        this.loadingService.hide();
        this.router.navigate(['organizations', this.organizationAddress, 'projects', this.projectId, 'tasks', taskId]);
      },
      error: err => {
        this.loadingService.hide();
        this.snackBar.open('Failed to create task', 'Dismiss', {
          duration: 3000,
        });
        console.error(err);
      },
    });
  }

  public add(event: MatChipInputEvent, isSkill: boolean): void {
    const value = (event.value || '').trim();
    isSkill ? this.addSkill(value) : this.addMember(value);
    event.chipInput.clear();
    this.skillInput.setValue('');
  }

  public remove(remove: Skill | Profile, isSkill: boolean): void {
    const index = isSkill
      ? this.skillChip.selectedItems.indexOf(remove as Skill)
      : this.memberChip.selectedItems.indexOf(remove as Profile);
    if (index >= 0) {
      if (isSkill) {
        this.skillChip.selectedItems.splice(index, 1);
        this.skillInput.setValue('');
      } else {
        this.memberChip.selectedItems.splice(index, 1);
        this.memberInput.setValue('');
      }
    }
  }

  public selected(event: MatAutocompleteSelectedEvent, isSkill: boolean): void {
    const name = event.option.viewValue;
    isSkill ? this.addSkill(name) : this.addMember(name);
    this.skillTextInput.nativeElement.value = '';
    this.skillInput.setValue('');
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

  private addSkill(skillName: string): Skill | null {
    const selectedSkill = this.skillChip.all.find(skill => skillName.toLowerCase() === skill.name.toLowerCase());
    if (!selectedSkill) return null;
    if (this.skillChip.selectedItems.includes(selectedSkill)) return null;
    this.skillChip.selectedItems.push(selectedSkill);
    return selectedSkill;
  }

  private filterSkill(value: string): Skill[] {
    const matchingItems = this.skillChip.all.filter((item: Skill) => {
      const name = item.name.toLowerCase();
      return name.includes(value.toLowerCase());
    });
    return matchingItems.filter(
      item => !this.skillChip.selectedItems.find(selectedItem => selectedItem.id === item.id)
    );
  }

  private filterMember(value: string): Profile[] {
    const matchingMembers = this.memberChip.all.filter(member => {
      const memberName = this.getMemberName(member).toLowerCase();
      return memberName.includes(value.toLowerCase());
    });
    return matchingMembers.filter(
      member => !this.memberChip.selectedItems.find((selectedMember: Profile) => selectedMember.id === member.id)
    );
  }
}

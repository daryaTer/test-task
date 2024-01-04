import { Component, Inject, OnDestroy } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Task } from '../../interfaces/task';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TaskService } from '../../services/tasks.service';
import { Subject, takeUntil } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  imports: [ MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatInputModule, MatCheckboxModule],
  providers: [TaskService],
  templateUrl: './edit-task-dialog.component.html',
  styleUrl: './edit-task-dialog.component.scss'
})
export class EditTaskDialogComponent implements OnDestroy {

  errorMessage: {
    text?: string;
    status?: string;
  } = {};

  form!: FormGroup;

  destroy$: Subject<boolean> = new Subject();

  constructor(
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task,
    private taskService: TaskService,
  ) {
    let taskCompleted = !(this.data.status === 0 || this.data.status === 1);
    this.form = new FormGroup({
      text: new FormControl(this.data.text, Validators.required),
      status: new FormControl(taskCompleted, Validators.required),
    })
  }

  editTask() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let taskStatus = this.getTaskStatus();

    this.taskService.editTask(this.data.id!, this.form.controls["text"].value, taskStatus)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        if (res.status === "ok") {
          this.dialogRef.close();
        }
        if (res.status === "error") {
          this.form.markAllAsTouched();
          this.errorMessage = res.message;
        }
      })

    this.dialogRef.close(this.form.value);
  }

  getTaskStatus(): number {
    let taskTextEdited = this.checkTaskTextEdited();
    const taskCompleted = +this.form.controls["status"].value;

    return +`${taskCompleted}${taskTextEdited}`
  }

  checkTaskTextEdited(): number {
    if (this.form.controls["text"].value !== this.data.text) {
      return 1;
    } else return 0;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

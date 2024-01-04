import { Component, OnDestroy } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../../services/tasks.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [ MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatInputModule, MatSelectModule],
  providers: [TaskService],
  templateUrl: './create-task-dialog.component.html',
  styleUrl: './create-task-dialog.component.scss'
})
export class CreateTaskDialogComponent implements OnDestroy {

  errorMessage: {
    username?: string;
    email?: string;
    text?: string
  } = {};

  form: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, Validators.email]),
    text: new FormControl("", Validators.required),
  })

  destroy$: Subject<boolean> = new Subject();

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    private taskService: TaskService,
  ) { }

  createTask() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.taskService.createTask(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.status === "ok") {
          this.dialogRef.close(res);
        }
        if (res.status === "error") {
          this.form.markAllAsTouched();
          this.errorMessage = res.message;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}

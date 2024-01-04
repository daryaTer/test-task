import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../../services/tasks.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Subject, catchError, of, take, takeUntil } from 'rxjs';
import { Task } from '../../interfaces/task';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../../shared/edit-item-dialog/edit-task-dialog.component';
import { CreateTaskDialogComponent } from '../../shared/create-task-dialog/create-task-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [HttpClientModule, MatPaginatorModule, MatRadioModule, FormsModule],
  providers: [TaskService],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tasks: Task[] = [];
  totalTasks: number = 0;

  sortFields: string[] = ["username", "email", "status"];
  selectedSortField: string = "";

  selectedSortDirection: "asc" | "desc" = "asc";

  enableTaskEditButton: boolean = false;

  destroy$: Subject<boolean> = new Subject();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    if (this.authService.hasToken()) {
      this.enableTaskEditButton = true;
    }
    this.loadTasks(1, this.selectedSortField, this.selectedSortDirection);
  }

  loadTasks(page: number, sortField?: string, sortDirection?: "asc" | "desc") {
    this.taskService.getTasks(page, sortField, sortDirection).pipe(
      take(1),
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Load error:', error);
        return of({ message: { tasks: [], total_task_count: 0 } });
      })
    ).subscribe(({ message: { tasks, total_task_count } }) => {
      this.tasks = tasks;
      this.totalTasks = total_task_count;
    });
  }

  editTask(id?: number) {
    let taskToUpdate = this.tasks.find(t => t.id === id);
    this.openEditTaskDialog(taskToUpdate)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
      )
      .subscribe(updatedTask => {
        console.log(updatedTask)
        if (!updatedTask) return;
        this.tasks = this.tasks.map(task => {
          if (task.id === id) {
            return { ...task, text: updatedTask.text, status: updatedTask.status };
          }
          return task;
        });
      });
  }

  createTask() {
    this.openEditTaskDialog()
      .pipe(
        takeUntil(this.destroy$),
        take(1),
      )
      .subscribe(newTask => {
        if (newTask) {
          this.updateCurrentPage();
          alert('Task successfully created!');
        }
      });
  }

  openEditTaskDialog(task?: Task) {
    const dialogConfig = {
      width: '350px',
      height: '500px',
      data: task || {},
    };

    if (task) {
      return this.dialog.open(EditTaskDialogComponent, dialogConfig).afterClosed();
    } else {
      return this.dialog.open(CreateTaskDialogComponent, dialogConfig).afterClosed();
    }
  }

  handlePageEvent(event: any) {
    this.loadTasks(event.pageIndex + 1, this.selectedSortField, this.selectedSortDirection);
  }

  onSortSettingChanged() {
    this.setPaginatorSettings(0);
  }

  updateCurrentPage() {
    let page = this.paginator.pageIndex;
    this.setPaginatorSettings(page);
  }

  setPaginatorSettings(page: number) {
    if (this.paginator) {
      this.paginator.pageIndex = page;
      this.paginator.page.emit({
        pageIndex: page,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      });
    }
  }

  logout() {
    this.authService.clearToken();
    this.enableTaskEditButton = false;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

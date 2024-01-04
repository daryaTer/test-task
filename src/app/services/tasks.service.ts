import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Observable, throwError } from "rxjs";
import { Status, Task } from "../interfaces/task";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class TaskService {

  constructor(private apiService: ApiService, private authService: AuthService) { }

  getTasks(page: number, sortField?: string, sortDirection?: string): Observable<any> {
    const params: any = {
      page,
      ...(sortField && { sort_field: sortField }),
      ...(sortDirection && { sort_direction: sortDirection })
    };

    return this.apiService.get('', params);
  }

  createTask(task: Task): Observable<any> {
    const formData = new FormData();
    formData.append('username', task.username);
    formData.append('email', task.email);
    formData.append('text', task.text);

    return this.apiService.post('create', formData);
  }

  editTask(id: number, text: string, status: number | Status): Observable<any> {
    const token = this.authService.getTokenFromStorage();
    if (!token) {
      console.error("Provide token");
      return throwError({ status: "error", message: { token: "Provide token" } });
    }
    
    const formData = new FormData();
    formData.append('text', text);
    formData.append('status', status.toString());
    formData.append('token', token);
 
    return this.apiService.postWithTokenRequired(`edit/${id}`, formData);
  }
}

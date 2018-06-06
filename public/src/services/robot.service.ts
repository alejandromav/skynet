import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Robot } from './../classes/robot';
import { environment } from '../environments/environment';

const httpOptions = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
	providedIn: 'root',
})
export class RobotService {
	constructor(private http: HttpClient) {}

	getAllRobots(username, token, tokenType = 'Bearer') {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'Authorization': `${tokenType} ${token}`
			})
		};

		const url = `${environment.apiUrl}/objects/${environment.robotsCollection}`;
		return this.http.get<Robot[]>(url, httpOptions);
	}
}

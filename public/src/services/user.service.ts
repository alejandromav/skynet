import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Subject } from 'rxjs';
import { User } from './../classes/user';
import { environment } from '../environments/environment';

const httpOptions = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private user$ = new Subject();
	private session$ = new Subject();

	constructor(private http: HttpClient) {}

	loginUser(username, password): Observable<User[]> {
		const url = `${environment.apiUrl}/users/login`;
		return this.http.post<User[]>(url, {
			username,
			password
		}, httpOptions);
	}

	signupUser(name, username, password, email): Observable<User[]> {
		const url = `${environment.apiUrl}/users`;
		return this.http.post<User[]>(url, {
			name,
			username,
			password,
			email
		}, httpOptions);
	}

	getUserDetails(username, token, tokenType = 'Bearer') {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'Authorization': `${tokenType} ${token}`
			})
		};

		const url = `${environment.apiUrl}/users/${username}`;
		return this.http.get<User[]>(url, httpOptions);
	}

	deleteSession() {
		localStorage.removeItem('session');
	}

	getCurrentUser() {
		return this.user$;
	}

	setCurrentUser(user) {
		this.user$.next(user);
	}

	getSession() {
		return this.session$;
	}

	getSavedSession() {
		return JSON.parse(localStorage.getItem('session'));
	}

	setSession(session) {
		if (session) {
			localStorage.setItem('session', JSON.stringify(session));
			this.session$.next(session);
		}
	}
}

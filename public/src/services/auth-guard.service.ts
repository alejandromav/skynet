import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import * as moment from 'moment';

import { UserService } from './../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
	constructor(public router: Router, private userService: UserService) {}

	canActivate(): boolean {
		const session = this.userService.getSavedSession();
		const sessionIsValid = session && (new Date(session['expire_at'])).valueOf() > moment().valueOf();

		if (sessionIsValid) {
			return true;
		} else {
			this.userService.deleteSession();
			this.router.navigate(['login']);
			return false;
		}
	}
}

import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [
		'./login.component.css',
		'../common/login.css',
		'../common/form.css',
		'../common/form-responsive.css',
		'../common/login-responsive.css'
	]
})
export class LoginComponent implements OnInit {
	public loading: Boolean = false;
	public error: String;
	public loginForm: FormGroup;
	public login = {
		username: null,
		password: null
	}

	constructor(public router: Router, private userService: UserService) {
		this.userService.deleteSession();
	}

	// Getters
	get username() { return this.loginForm.get('username'); }
	get password() { return this.loginForm.get('password'); }

	ngOnInit(): void {
		this.loginForm = new FormGroup({
			'username': new FormControl(this.login.username, [Validators.required]),
			'password': new FormControl(this.login.password, [Validators.required]),
		});
	}

	// Form submit controller
	async onSubmit() {
		if (!this.loginForm.invalid) {
			console.log('Form submitted', this.login);

			this.loginForm.disable();
			this.loading = true;
			this.error = null;

			this.userService.loginUser(this.username.value, this.password.value)
				.subscribe(
					res => {
						this.loading = false;
						this.loginForm.enable();
						const session = res['data']['session'];

						this.userService.saveSession(session);
						this.router.navigate(['']);
					}, err => {
						this.loading = false;
						this.loginForm.enable();
						this.error = err['error']['err'] || 'Internal server error';
				});
		}
	}
}

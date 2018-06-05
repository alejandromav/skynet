import { Component, OnInit } from '@angular/core';
import { UserService } from './../services/user.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css', './app-responsive.component.css' ]
})
export class AppComponent implements OnInit {
	public session;
	public menu = {
		show: null
	};

	constructor(
		public router: Router,
		private userService: UserService
	) {
		this.menu.show = null;
	}

	ngOnInit() {
		// Removes preloader
		const preLoader = document.getElementById('preloader');
		preLoader.parentNode.removeChild(preLoader);
		this.session = this.userService.getSavedSession();

		this.userService.getSession().subscribe(session => {
			this.session = session;
			console.log('Current session: ', this.session);
		});
	}

	logOut() {
		try {
			this.menu.show = null;
			delete this.session;
			this.userService.deleteSession();
			this.router.navigate(['/login']);
		} catch (e) {
			console.error(e);
		}
	}
}

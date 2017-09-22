import {
  Component,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  APP_USER,
  GENDERS,
  EMAIL_REGEXP,
  PAGES_LIST,
  USER_ROLES,
  USER_STATUSES,
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_SUCCESS_MESSAGE
} from '../../constants';
import {
  AuthService,
  PermissionService,
  UserService
} from '../../services/index';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'user',
  providers: [ PermissionService, UserService ],
  styleUrls: ['./user.component.scss'],
  templateUrl: './user.component.html',
  encapsulation: ViewEncapsulation.None
})
export class UserComponent implements OnInit, OnDestroy {
  @ViewChild('userProfileForm') public formGroup;

  public loading: boolean = false;
  public isDisabled: boolean = true;
  public genders: [object] = GENDERS;
  public chosenUser: any = {};
  public unchangedUserData: any = {};
  public activeAppUser: any = JSON.parse(atob(localStorage.getItem(APP_USER)));
  public routeIdParam: string = '';
  public routeTabParam: any = '';
  public userRoles: [object] = USER_ROLES;
  public userStatuses: [object] = USER_STATUSES;
  public dobOptions: any = {
    format: 'dd/mm/yyyy'
  };
  public emailRegExp: any = EMAIL_REGEXP;
  public hasChanges: boolean = false;

  private PAGES_LIST: any = PAGES_LIST;
  private subscriber: any;

  // TypeScript public modifiers
  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _permission: PermissionService
  ) {}

  public ngOnInit() {
    this.subscriber = this.route.params.subscribe((params: any) => {
      const routeParamsUserId = params['id'];
      this.routeIdParam = routeParamsUserId;
      if (routeParamsUserId && routeParamsUserId !== 'new') {
        if (routeParamsUserId === 'profile') {
          this.getOneUser(routeParamsUserId);
        } else {
          this._permission.isAllowedAction('edit', this.activeAppUser.role) ?
            this.getOneUser(routeParamsUserId) : this._auth.signOut();
        }
      } else {
        this.isDisabled = false;
        this._permission.isAllowedAction('edit', this.activeAppUser.role) ?
          this.chosenUser = {} : this._auth.signOut();
      }
    });
  }

  public onFormChange() {
    this.hasChanges = !_.isEqual(this.chosenUser, this.unchangedUserData);
  }

  public ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

  public getOneUser(userId) {
    this.loading = true;
    this._userService.getOneUser(userId)
      .subscribe(
        (user: any) => {
          if (this._permission.isMe(user.data) ||
            this._permission.isAllowedAction('role', user.data.role)) {
            const userData = user.data;
            if (userData.dob) {
              // Formatting date to format needed for mdInput type='date'
              userData.dob = moment(new Date(userData.dob)).format('YYYY-MM-DD');
            }
            this.chosenUser = userData;
            this.unchangedUserData = _.clone(userData);
            this.loading = false;
            // localStorage.setItem(APP_USER, btoa(JSON.stringify(userData)));
          } else {
            const message: string = 'Not allowed action!';
            this.showSnackBarMessage(message);
            this.goBack();
          }
        },
        (err: any) => {
          const errorData = JSON.parse(err._body);
          this.loading = false;
          if (_.hasIn(errorData, 'error.message')) {
            this.showErrorMessage(errorData.error.message);
          }
          this.goBack();
        }
      );
  }

  public goBack() {
    for (const page of this.PAGES_LIST) {
      if (this._permission.isAllowedAction('view', page.permissionRef)) {
        this.router.navigate(page.routerLink);
        break;
      }
    }
  }

  public showErrorMessage(message?: string) {
    console.log(message ? message : DEFAULT_ERROR_MESSAGE);
  }

  public showSnackBarMessage(message: string) {
    console.log(message ? message : DEFAULT_ERROR_MESSAGE);
  }

  public formatDateTime(dateTime: string) {
    return moment(new Date(dateTime)).format('YYYY-MM-DD HH:mm');
  }

  public isAllowedAction(actionName: string, entityName: string) {
    return this._permission.isAllowedAction(actionName, entityName);
  }

  public isMe(data) {
    return this._permission.isMe(data);
  }

  public isAdmin(data) {
    return this._permission.isAdmin(data);
  }

  public historyBack() {
    history.back();
  }

  public navigateTo(destination) {
    if (destination && destination.length) {
      this.router.navigate(destination);
    }
  };

  public disableItem(userId) {
    console.log('disableItem: ', userId);
  };

  public editItem(userId) {
    console.log('editItem: ', userId);
  };

  public save(user) {
    console.log('save: ', user);
    let changedProps = _.reduce(this.unchangedUserData, function(result, value, key) {
      return _.isEqual(value, user[key]) ?
        result : result.concat(key);
    }, []);
    let updatedUser: any = {};
    _.forEach(changedProps, (item: string) => {
      updatedUser[item] = user[item];
    });
    if (user.id && user.id !== 'new') {
      updatedUser.id = user.id;
      if (updatedUser.password) {
        delete updatedUser.password;
      }
      this.updateUser(updatedUser);
    } else {
      this.createUser(this.chosenUser);
    }
    console.log('changedProps: ', changedProps, ' updatedUser: ', updatedUser);
  };

  public createUser(newUser: any) {
    this.loading = true;
    this._userService.createUser(newUser)
      .subscribe(
        (resp: any) => {
          this.loading = false;
          this.hasChanges = false;
          this.router.navigate(['', 'users']);
        },
        (err: any) => {
          this.loading = false;
          console.log('err: ', err);
        }
      );
  }

  public updateUser(updatedUser: any) {
    this.loading = true;
    this._userService.updateUser(updatedUser)
      .subscribe(
        (resp: any) => {
          this.loading = false;
          this.hasChanges = false;
          this.router.navigate(['', 'users']);
        },
        (err: any) => {
          this.loading = false;
          console.log('err: ', err);
        }
      );
  }

  public dateChanged(date) {
    const dob: any = new Date(date);
    const isDobCorrect: boolean = dob < this.minAge() && dob > this.maxAge();
    if (!isDobCorrect) {
      this.formGroup.form.controls['dob'].setErrors({valid: isDobCorrect});
    }
  }

  public minAge() {
    const minUserAge: any = 14;
    const today: any = new Date();
    return new Date(today.getFullYear() - minUserAge, today.getMonth(), today.getDate());
  }

  public maxAge() {
    const maxUserAge: any = 100;
    const today: any = new Date();
    return new Date(today.getFullYear() - maxUserAge, today.getMonth(), today.getDate());
  }
}

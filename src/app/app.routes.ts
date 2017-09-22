import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';
import { AuthService } from './services/index';
import {
  MainComponent,
  SigninComponent,
  UserComponent,
  UsersComponent
} from './pages/index';
import { ConfirmDeactivateGuard } from './services/index';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'signin', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'users/new', component: UserComponent, canDeactivate: [ConfirmDeactivateGuard] },
      { path: 'users/:id', component: UserComponent, canDeactivate: [ConfirmDeactivateGuard] }
    ]
  },
  { path: 'signin', component: SigninComponent },
  { path: '**',    component: NoContentComponent }
];

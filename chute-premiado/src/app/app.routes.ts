import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/user-login/user-login').then(m => m.UserLoginComponent),
  },
  {
    path: 'credits',
    loadComponent: () =>
      import('./features/credits/credits').then(m => m.CreditsComponent),
  },
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/admin/login/admin-login').then(m => m.AdminLoginComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'players',
        loadComponent: () =>
          import('./features/admin/players/players').then(m => m.PlayersComponent),
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./features/admin/finance/finance').then(m => m.FinanceComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];

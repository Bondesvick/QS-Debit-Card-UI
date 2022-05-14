import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'debit-card',
    loadChildren: () => import('./pages/debit-card/debit-card.module').then(m => m.DebitCardModule),
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'debit-card',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

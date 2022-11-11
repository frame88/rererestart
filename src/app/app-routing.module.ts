import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/login/auth.guard';

const routes: Routes = [

  // {
  //   path:'',
  //   redirectTo: 'chat/',
  //   pathMatch: 'full',


  // },
  {
    path: 'chat/:id',
    loadChildren: () => import('./features/chat-page/folder.module').then( m => m.FolderPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./core/login/login/login.module').then(m => m.LoginPageModule),

  },  {
    path: '**',
    redirectTo:'login',
    // pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

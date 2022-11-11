import { Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular/providers/nav-controller';
import { AuthService } from 'src/app/core/login/auth.service';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

  login: FormGroup = this.fb.group({
    user: ['', Validators.required],
    pass: ['', Validators.required]
  });

  constructor(private fb: FormBuilder,
  public auth: AuthService,
  private route: Router,
  private menuCtrl: MenuController
  ) {

  }
  ngOnInit(): void {
      this.menuCtrl.enable(false);

      if(this.auth.isLogged()){
        this.route.navigateByUrl('/chat/', {replaceUrl : true})
        ;
      }
  }
}

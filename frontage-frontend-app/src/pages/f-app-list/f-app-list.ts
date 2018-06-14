import { Vibration } from '@ionic-native/vibration';
import { AuthenticationProvider } from './../../providers/authentication/authentication';
import { AdminProvider } from './../../providers/admin/admin';
import { SnapOptionsPage } from './../snap-options/snap-options';
import { TetrisOptionsPage } from './../tetris-options/tetris-options';
import { SnakeOptionsPage } from './../snake-options/snake-options';
import { SweepRandOptionsPage } from './../sweep-rand-options/sweep-rand-options';
import { RandomFlashingOptionsPage } from './../random-flashing-options/random-flashing-options';
import { FlagsOptionsPage } from './../flags-options/flags-options';
import { FApp } from './../../models/fapp';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DataFAppsProvider } from '../../providers/data-f-apps/data-f-apps';
import { SweepAsyncOptionsPage } from '../sweep-async-options/sweep-async-options';
import { LocalStorageProvider } from '../../providers/local-storage/local-storage';
import { SettingPage } from '../setting/setting';
import { SnapJoystickPage } from '../snap-joystick/snap-joystick';

@Component({
  selector: 'page-f-app-list',
  templateUrl: 'f-app-list.html',
})
export class FAppListPage {

  fAppList: FApp[];
  fAppPosition: number;
  isAdmin: boolean = false;
  isFacadeUp: boolean = false;
  isForced: boolean = false;
  currentApp: any;

  constructor(public navCtrl: NavController,
    public fAppsData: DataFAppsProvider,
    public localStorageProvider: LocalStorageProvider,
    public adminProvider: AdminProvider,
    public dataFAppsProvider: DataFAppsProvider,
    public authentication: AuthenticationProvider,
    public vibration: Vibration) {
    //Check if the connected user is admin
    this.isAdmin = this.localStorageProvider.isAdmin();

    //Get the f-app list
    fAppsData.getList()
      .subscribe(fAppList => this.fAppList = fAppList, err => console.log(err));

    this.dataFAppsProvider.getCurrentApp().subscribe(err => console.log(err));

  }

  ionViewWillEnter() {
    this.authentication.isFacadeUp()
      .subscribe(res => {
        this.isFacadeUp = res.is_usable;
        this.isForced = res.is_forced;
        this.currentApp = res.current_app;
      });
  }

  showOptions(fApp: FApp) {
    if (!this.isForced) {
      this.navCtrl.push(this.establishNavigationPageName(fApp.name), { selectedFapp: fApp });
    } else if ('Snap' == this.currentApp) {
      this.navCtrl.push(SnapJoystickPage, { joystickParams: "" });
    }
  }

  /**
   * Admin Actions
   */
  updateScheduledApp(fApp: FApp) {
    this.adminProvider.setScheduledFApp(fApp).subscribe(err => console.log(err));
  }

  unForceFApp() {
    this.vibration.vibrate(50)
    this.adminProvider.unForceFApp().subscribe(() => {
      //Refresh the fapp list when an app is unforced
      setTimeout(() => {
        this.authentication.isFacadeUp()
          .subscribe(res => {
            this.isFacadeUp = res.is_usable;
            this.isForced = res.is_forced;
            this.currentApp = res.current_app;
          });
      }, 1000);
    });
  }

  /** 
   * Navigation
  */

  goToSettings() {
    this.navCtrl.push(SettingPage);
  }

  private establishNavigationPageName(fAppName: string): any {
    switch (fAppName) {
      case "Flags": {
        return FlagsOptionsPage;
      }
      case "RandomFlashing": {
        return RandomFlashingOptionsPage;
      }
      case "SweepAsync": {
        return SweepAsyncOptionsPage;
      }
      case "SweepRand": {
        return SweepRandOptionsPage;
      }
      case "Snake": {
        return SnakeOptionsPage;
      }
      case "Tetris": {
        return TetrisOptionsPage;
      }
      case "Snap": {
        return SnapOptionsPage
      }
      default: {
        return FlagsOptionsPage;
      }
    }
  }
}

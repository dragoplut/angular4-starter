import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LANG_KEY } from '../../constants';
// tslint:disable-next-line
import * as _ from 'lodash';

@Component({
  selector: 'lang-selector',
  styleUrls: [ `./lang-selector.component.scss` ],
  templateUrl: `./lang-selector.component.html`,
  providers: [ TranslateService ]
})
export class LangSelectorComponent implements OnInit {

  public chosenLang: string = 'en';
  public languages: any = [
    { value: 'en', viewValue: 'EN' },
    { value: 'ua', viewValue: 'UA' },
  ];

  constructor(private translate: TranslateService) {}

  public ngOnInit() {
    console.log('LangSelectorComponent init.');
    var appLang: any = localStorage.getItem(LANG_KEY);
    if (!appLang) {
      this.setLang(this.chosenLang);
    } else {
      this.chosenLang = appLang;
    }
  }

  public changeLang(lang: string) {
    if (typeof lang === 'string') {
      this.setLang(lang);
      this.translate.use(lang);
      this.translate.reloadLang(lang);
    }
  }

  public setLang(lang: string) {
    localStorage.setItem(LANG_KEY, lang);
  }
}

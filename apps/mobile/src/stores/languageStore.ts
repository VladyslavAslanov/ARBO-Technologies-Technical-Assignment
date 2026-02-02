import { makeAutoObservable, runInAction } from "mobx";
import i18n, { AppLanguage } from "../i18n";

export class LanguageStore {
  language: AppLanguage = i18n.language as AppLanguage;
  isReady = false;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    runInAction(() => {
      this.language = i18n.language as AppLanguage;
      this.isReady = true;
    });
  }

  async setLanguage(lang: AppLanguage) {
    await i18n.changeLanguage(lang);

    runInAction(() => {
      this.language = lang;
    });
  }
}
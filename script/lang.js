import { loadLanguage } from "./loaders.js"
import settings from "./settings.js"
import gameHandler from "./game/game-handler.js"
import $ from "./shortcuts.js"

class Locale {
  constructor() {
    this.languages = [
      "en_US",
      "ja_JP",
    ]
    // this.languages = ['en_US'];
    this.files = [
      "ui",
      "menu_general",
      "menu_root",
      "menu_controls",
      "menu_tuning",
      "menu_audio",
      "menu_video",
	  "menu_daspresets",
	  "menu_settings",
      "action-text",
      "mode-options",
	  "mode-labels",
    ]
    this.test = new Promise(function (resolve, reject) {
      resolve("test")
    })
    this.currentLanguage = "en_US"
    this.loaded = {}
    for (const file of this.files) {
      this[file] = {}
    }
  }
  getString(file, name, vars = []) {
    if (this.currentLanguage === "blank") {
      return "⠀⠀⠀⠀⠀⠀"
    }
    try {
      let str = this[file][this.currentLanguage][name].message
      for (let i = 0; i < vars.length; i++) {
        const replacement = vars[i]
        const placeholderString = `%${i + 1}`
        const placeholder = new RegExp(placeholderString, "g")
        str = str.replace(placeholder, replacement)
      }
      return str
    } catch (error) {
      if (name === "grade") return "Grade"
      return "?UNKNOWN"
    }
  }
  loadAll() {
    const load = new Promise((resolve) => {
      const toLoad = this.languages.length * this.files.length
      let loaded = 0
      for (const file of this.files) {
        this[file] = {}
        for (const language of this.languages) {
          loadLanguage(language, file).then((languageFile) => {
            this[file][language] = languageFile
            loaded++
            if (loaded >= toLoad) {
              resolve("done!")
            }
          })
        }
      }
    })
    return load.then((string) => {
      this.currentLanguage = settings.settings.language
      return string
    })
  }
  loadLang(language) {
    const load = new Promise((resolve) => {
      if (this.loaded[language] || language === "blank") {
        resolve("done!")
      } else {
        const toLoad = this.files.length
        let loaded = 0
        for (const file of this.files) {
          loadLanguage(language, file).then((languageFile) => {
            this[file][language] = languageFile
            loaded++
            if (loaded >= toLoad) {
              this.loaded[language] = true
              resolve("done!")
            }
          })
        }
      }
    })
    return load.then((string) => {
      this.currentLanguage = settings.settings.language
      return string
    })
  }
  changeLang(locale) {
    this.currentLanguage = locale
    settings.settings.language = locale
    this.updateFonts()
    this.updateTitle()
    this.updateLightWarning()
    settings.saveSettings()
  }

  updateLightWarning() {
    const str = this.getString("ui", "flashingLights")
    $(
      "#lights-warning"
    ).innerHTML = `<img src="img/tetrion/warning.svg" alt=""> ${str} ${
      str.toLowerCase() === "flashing lights" ? "" : " (Flashing Lights)"
    }`
  }

  updateTitle() {
    document.documentElement.style.setProperty(
      "--logo-image",
      `url("../img/brand/logo/default.svg")`
    )
    return
  }
  updateFonts() {
    const root = document.documentElement
    switch (this.currentLanguage) {
      case "zh_CN":
        root.style.setProperty(
          "--main-font",
          '"Roboto", "Noto Sans SC", "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif'
        )
        break
      case "ja_JP":
        root.style.setProperty(
          "--main-font",
          '"Roboto", "Noto Sans JP", "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Osaka, メイリオ, Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック" , "MS Gothic", "Noto Sans CJK JP", TakaoPGothic, sans-serif'
        )
        break
      default:
        root.style.setProperty("--main-font", '"Roboto", sans-serif')
        break
    }
  }
}
const locale = new Locale()
export default locale

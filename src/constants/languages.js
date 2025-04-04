import {engLangNames} from './engLangNames';

export const lang2to3letters = {
  en: "eng",
  es: "spa",
}

export const langName = {
}

export const navLangList = [ "es", "en" ]

export const extraEngLangName = {
}


export const getEngLangName = (lang) => {
  return extraEngLangName[lang] || engLangNames.main.en.localeDisplayNames.languages[lang]
}

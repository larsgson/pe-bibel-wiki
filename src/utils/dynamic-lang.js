import { obsStoryList } from '../constants/obsHierarchy'
import { fullBibleList, newTestamentList } from '../constants/bibleData'
import { lang2to3letters } from '../constants/languages'
import { gospelOfJohnObj } from '../constants/naviChaptersJohn'

const bibleDataEnOBSStory = {
  freeType: false,
  curPath: "",
  title: "Open Bible Stories",
  description: "",
  image: {
      origin: "Local",
      filename: ""
  },
  language: "en",
  langID: "en",
  mediaType: "audio",
  episodeList: obsStoryList,
  uniqueID: "uW.OBS.en"
}

export const langVersion = {
  as: "irv", 
  bn: "irv", 
  en: "esv", 
  gu: "irv", 
  har: "hb", 
  hi: "irv", 
  kn: "irv", 
  ml: "irv", 
  mr: "irv", 
  ne: "ulb", 
  ory: "irv", 
  pu: "irv", 
  ta: "irv", 
  te: "irv", 
  ur: "irv", 
}

export const selectAudioBible = (lang) => 
lang === "en" 
  ? "en-audio-bible-WEB" 
  : lang === "es" 
  ? "es-audio-bible-WordProject" 
  : lang === "fr" 
  ? "fr-audio-bible-WordProject" 
  : lang === "hu" 
  ? "hu-audio-bible-WordProject" 
  : lang === "lu" 
  ? "lu-audio-bible-WordProject" 
  : lang === "ro" 
  ? "ro-audio-bible-WordProject" 
  : lang === "es" 
  ? "es-audio-bible-WordProject" 
  : lang === "de" 
  ? "de-audio-bible-ML"
  : `audio-bible-bb-project-${lang}` 

export const limitToNT = [ "xyz" ] // To Do - get this info from Bible Brain

export const navLangList = [ "en", "es"]

export const getSerie = (lang,serId) => {
  const checkObj = {
    "en-jhn-serie": gospelOfJohnObj,
    "en-audio-OBS": bibleDataEnOBSStory,
  }
  const is3LetterLang = (lang.length > 2)
  const curLang = is3LetterLang ? lang : lang2to3letters[lang]
  if (checkObj[serId]) return checkObj[serId]
  else if (lang === "es") {
    return {
      "bibleBookList": fullBibleList,
      "wordProjectType": true,
      "curPath": "https://storage.googleapis.com/audio.bibel.wiki/wp/6/", // or http://audio.bibel.wiki/wp/6/
      "title": "Audio Biblia",
      uniqueID: "WordProject.ES",
      "description": "Public domain",
      "language": "es",
      langID: "es",
      "mediaType": "bible",
      "image": {
         "origin": "Local",
         "filename": "pics/Bible_OT.png"
      }
    }
  } else if (lang !== "en") {
    return {
      bibleBookList: newTestamentList,
      bbProjectType: true,
      basePath: "https://demo-api-bibel-wiki.netlify.app/.netlify/functions", 
      title: "Audio Biblia",
      uniqueID: `BibleBrainProject.${lang}`,
      description: "Public domain",
      language: lang,
      langID: lang,
      mediaType: "bible",
      image: {
         origin: "Local",
         filename: "pics/Bible_OT.png"
      }
   }   
  } else {
    const useVersion = langVersion[lang]
    const usePath = "https://vachan.sgp1.cdn.digitaloceanspaces.com/audio_bibles/"
    let curPath = ""
    if (useVersion) {
      curPath = `${usePath}${curLang}/${useVersion}/` 
    } else {
      curPath = `${usePath}${curLang}/`
    }
    const useLimitedList = limitToNT.includes(lang)
    const vachanServerType = (lang === "en")
    return {
      bibleBookList: useLimitedList ? newTestamentList : fullBibleList,
      vachanServerType,
      curPath,
      title: "Audio Bibel",
      uniqueID: `Vachan-${lang}`,
      description: "Public domain",
      language: lang,
      langID: lang,
      mediaType: "bible",
      image: {
        origin: "Local",
        filename: "pics/Bible_OT.png"
      }
    }
  }
}

export const serieLang = (id) => {
  const checkObj = {
    "de-audio-bible-ML": "de",
    "en-audio-bible-WEB": "en",
    "es-audio-bible-WordProject": "es",
    "pt-br-audio-bible-WordProject": "pt-br",
    "fr-audio-bible-WordProject": "fr",
    "hu-audio-bible-WordProject": "hu",
    "lu-audio-bible-WordProject": "lu",
    "ro-audio-bible-WordProject": "ro",
    "de-jhn-serie": "de",
    "en-jhn-serie": "en",
    "de-jhn-plan": "de",
    "en-jhn-plan": "en",
    "en-audio-OBS": "en",
  }
  // return checkObj[id]
  return "en"
}

export const serieNaviType =(id) => {
  const checkObj = {
    "en-audio-bible-WEB": "audioBible",
    "en-jhn-serie": "videoSerie",
    "en-jhn-plan": "videoPlan",
    "en-audio-OBS": "audioStories",
  }
  return checkObj[id] || "audioBible"
}

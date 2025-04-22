import React, { useState, useEffect, useCallback  } from 'react'
import { apiSetStorage, apiGetStorage, apiObjGetStorage, apiObjSetStorage } from '../utils/api'
import { unique } from 'shorthash'
import { pad, getChFreePic, getChFreePicFirstEntry } from '../utils/obj-functions'
import { useTranslation } from 'react-i18next'
import { serieLang, serieNaviType } from '../utils/dynamic-lang'
import { freeAudioIdOsisMap, osisFromFreeAudioId } from '../constants/osisFreeAudiobible'
import { contentByCountry } from '../constants/content-by-country-pe'
import { audioByBID } from '../constants/audio-by-b-id'
import { osisIconList } from '../constants/osisIconList'
import { checkAudioHasTimestamps } from '../utils/audio-with-timestamps'

const audioTypePriority = {ad: 4, a: 3, ads: 2, as: 1}

const getAudioFilesetId = (langID) => {
  let filesetID = "" 
  let curPriority = 0
  const audioIDList = contentByCountry.PE[langID]?.a
  audioIDList.forEach(audioID => {
    const fIDList = audioByBID[audioID]
    Object.keys(fIDList).forEach(key => {
      const aType = fIDList[key].t
      let chkP = audioTypePriority[aType]
      // Always prioritise higher for audio with timestamps - add 10
      if (checkAudioHasTimestamps(key)) chkP += 10
      if (chkP>curPriority) {
        curPriority = chkP 
        filesetID = key
      }
    })  
  })
  return filesetID
}

const getTextFilesetId = (langID,audioID) => { 
  let retFilesetID = "" 
  const textIDList = contentByCountry.PE[langID]?.t
  if (textIDList.length>0) {
    retFilesetID = textIDList[0] // select first entry by default
    if (textIDList.length>1) // go through list, if more than one
    textIDList.forEach(textID => {
      // Prioritise equal to audioID, if exists
      if (textID === audioID) retFilesetID = audioID
    })
  }
  return retFilesetID
}

const MediaPlayerContext = React.createContext([{}, () => {}])
const MediaPlayerProvider = (props) => {
  const [state, setState] = useState({
    isPlaying: false,
  })
  const { t } = useTranslation()
  const setStateKeyVal = (key,val) => setState(state => ({ ...state, [key]: val }))

  const [isPaused, setIsPaused] = useState(false)
  const [imgPosOBS, setImgPosOBS] = useState({})
  const [imgPosAudio, setImgPosAudio] = useState({})
  const [verseTextPosAudio, setVerseTextPosAudio] = useState([])
  const [verseText, setVerseText] = useState({})
  const apiBasePath = "https://demo-api-bibel-wiki.netlify.app/.netlify/functions"
  const [timestampParamStr, SetTimestampParamStr] = useState("")
  const [textParamStr, SetTextParamStr] = useState("")

  const fetchJSONDataFrom = useCallback(async (inx) => {
    const response = await fetch(`data/img_pos${pad(inx +1)}.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    const data = await response.json();
    setImgPosOBS((prev) => ({
      ...prev,
      [inx]: data,
    }));
  }, []);

  useEffect(() => {
    const getDataForAllStories = async () => {
      const maxStories = 50
      for(let i=0; i < maxStories; i++) {
        // Wait for each task to finish
        await fetchJSONDataFrom(i);
      }      
    }
    getDataForAllStories()
  }, [fetchJSONDataFrom]);

  useEffect(() => {
    const getNavHist = async () => {
      const navHist = await apiGetStorage("navHist")
      setState(prev => ({...prev, navHist}))
    }
    getNavHist()
  }, []);


  useEffect(() => {
    const getTimecodeData = async () => {
      if (timestampParamStr.length>0) {
        const fetchTimestampPath = `${apiBasePath}/get-timestamps`
        const curApiParam = JSON.parse(timestampParamStr)
        const curBook = osisFromFreeAudioId(curApiParam?.bookID)
        const curCh = curApiParam?.ch
        let curIconList = []
        if (osisIconList[curBook]) {
          curIconList = osisIconList[curBook][curCh] || []
          if (curIconList.length>1) {
            const resTimestamp = await fetch(fetchTimestampPath, {
              method: 'POST',
              body: timestampParamStr
            })
            .then(resTimestamp => resTimestamp.json())
            .catch(error => console.error(error))
            setVerseTextPosAudio(resTimestamp?.data)
            const timestampPoints = curIconList.map((verse,inx) => {
              let vInx = parseInt(verse.slice(0,2))
              // Check for double entry (i.e. with added letter at the end)
              if ((verse.length>2) && (inx>0)) {
                const vPrev = parseInt(curIconLis[inx-1].slice(0,2))
                if (curIconLis[inx+1]) {
                  const vNext = parseInt(curIconLis[inx+1].slice(0,2))
                  const diff = cNext - vPrev
                  // if possible then move the double to one verse later - if diff > 1
                  if (diff>1) vInx += 1
                }
              }
              const pos = resTimestamp?.data[vInx]?.timestamp
              return {
                img: `${pad(curCh)}_${verse}`,
                pos
              }
            })
            setImgPosAudio(timestampPoints)
          }  
        }
      }
    }
    getTimecodeData()
  }, [timestampParamStr]);

  useEffect(() => {
    const getTextData = async () => {
      if (textParamStr.length>0) {
        const fetchTextPath = `${apiBasePath}/get-text`
        const resText = await fetch(fetchTextPath, {
          method: 'POST',
          body: textParamStr
        })
        .then(resText => resText.json())
        .catch(error => console.error(error))
        const useVerseText = {}
        resText?.data.forEach(obj => {
          useVerseText[obj.verse_start] = obj.verse_text
        })
        setVerseText(useVerseText)
      }
    }
    getTextData()
  }, [textParamStr]);
  
  const togglePlay = () => {
//    state.isPlaying ? player.pause() : player.play()
    setStateKeyVal( "isPlaying", !state.isPlaying )
  }

  const skipToNextTrack = () => {
//    playTrack(newIndex)
  }

  const onFinishedPlaying = () => {
    console.log("onFinishedPlaying")
    if (state.curPlay) {
      apiObjSetStorage(state.curPlay,"mSec",state.curEp.begTimeSec * 1000) // Reset the position to beginning
      const {curSerie, curEp} = state.curPlay
      if (curSerie){
        if ((curSerie.episodeList!=null) && (curSerie.episodeList.length>0)
            && (curEp!=null)){
          // This serie has episodes
          let epInx = curEp.id
          epInx+=1
          let newPlayObj = {curSerie}
          apiObjSetStorage(newPlayObj,"curEp",epInx)
          if (curSerie.episodeList[epInx]!=null){
            newPlayObj.curEp=curSerie.episodeList[epInx]
          }
          setStateKeyVal( "curPlay", newPlayObj)
        } else {
          let newPlayObj
          setStateKeyVal( "curPlay", newPlayObj)
        }
      }
    }
  }

  const onStopPlaying = () => {
    setStateKeyVal( "curPlay", undefined )
    setStateKeyVal( "curSerie", undefined )
    setStateKeyVal( "curEp", undefined )
  }

  const updateImgBasedOnPos = ( navType, ep, curInx, msPos ) => {
    let checkMsPosArray = []
    let curImgSrc = ""
    let retStr = ""
    if ((navType === "audioStories") && (imgPosOBS)) {
      checkMsPosArray = imgPosOBS[ curInx ]
      curImgSrc = `${pad(curInx+1)}-01`
    } else if (navType === "audioBible") {
      checkMsPosArray = imgPosAudio
    }
    (checkMsPosArray?.length>0) && checkMsPosArray?.map(checkObj => {
      const checkMs = parseInt(checkObj.pos) * 1000
      if (msPos>=checkMs) curImgSrc = checkObj.img
    })  
    if (navType === "audioStories") {
      retStr = `https://storage.googleapis.com/img.bibel.wiki/obsIcons/obs-en-${curImgSrc}.mp4`
    } else if (navType === "audioBible") {
      const bk = ep?.bookObj
      if (curImgSrc && (curImgSrc?.length > 0)) {
        retStr = getChFreePic(bk,ep?.id,curImgSrc)
      } else {
        const tempImgObj = getChFreePicFirstEntry(bk,ep?.id)
        retStr = tempImgObj.imgSrc
      }
    }
    return retStr
  }

  const updateTextBasedOnPos = ( msPos ) => {
    let retStr = ""
    let checkVerseInx = 0
    const offsetMs = 300
    const checkMsPosArray = verseTextPosAudio
    if ((checkMsPosArray) && (checkMsPosArray?.length>0)) {
      checkMsPosArray?.map(checkObj => {
        const checkMs = checkObj.timestamp * 1000
        if ((msPos+offsetMs)>=checkMs) checkVerseInx = parseInt(checkObj.verse_start)
      })
    }
    if (checkVerseInx>0) retStr = verseText[checkVerseInx] || ""
    return retStr
  }


  const onPlaying = (curPos) => {
    const curImgSrc = state?.syncImgSrc
    const curInx = state?.curEp?.id
    const msPos = curPos?.position
    const curSerId = state?.curPlay?.curSerie?.uniqueID
    let nextImgSrc
    const curEp = state?.curPlay?.curEp
    const topIdStr = curEp?.topIdStr
    const nType = serieNaviType(topIdStr)

    if ((curSerId === "uW.OBS.en") || (nType === "audioBible")) {
      nextImgSrc = updateImgBasedOnPos( nType, curEp, curInx, msPos )
    }
    if (nextImgSrc!==curImgSrc) {
      setStateKeyVal( "syncImgSrc", nextImgSrc )
    }
    let nextText
    const curVerseText = state?.syncVerseText
    if (nType === "audioBible") {
      nextText = updateTextBasedOnPos( msPos )
    }
    if (nextText!==curVerseText) {
      console.log(nextText)
      setStateKeyVal( "syncVerseText", nextText )
    }
    setStateKeyVal( "curPos", curPos )
  }

  const updateStorage = async (idStr,val) => {
    await apiSetStorage(idStr,val)
  }

  const startPlay = async (topIdStr,inx,curSerie,curEp) => {
    if (curSerie.bbProjectType) {
      const fetchPath = `${apiBasePath}/get-audio-url`
      // 'get-timestamps'
      const audioFilesetID = getAudioFilesetId(curSerie.langID)
      const response = await fetch(fetchPath, {
        method: 'POST',
        body: JSON.stringify({
          filesetID: audioFilesetID,
          bookID: freeAudioIdOsisMap[curEp?.bk],
          ch: curEp?.id,
          query: ["path"]
        })
      }).then(response => response.json())
      curSerie.curPath = response?.data?.path
      SetTextParamStr(JSON.stringify({
        filesetID: getTextFilesetId(curSerie.langID,audioFilesetID),
        bookID: freeAudioIdOsisMap[curEp?.bk],
        ch: curEp?.id,
        query: ["verse_text", "verse_start"]
        // const response = await fetch('/.netlify/functions/get-text', {
      }))
      if (checkAudioHasTimestamps(audioFilesetID)) {
        // fetch timecode in the background
        SetTimestampParamStr(JSON.stringify({
          filesetID: audioFilesetID,
          bookID: freeAudioIdOsisMap[curEp?.bk],
          ch: curEp?.id,
          query: ["verse_start", "timestamp"]
        }))
      }
    }
    if (!curSerie){ // stop playing
      let newPlayObj
      setStateKeyVal( "curPlay", newPlayObj)
    } else {
      let tmpEp = curEp
      if ((!tmpEp) && (curSerie.episodeList!=null)
          && (curSerie.episodeList[inx]!=null)){
        tmpEp=curSerie.episodeList[inx]
      }
      // This serie has episodes
      let newPlayObj = {curSerie,curEp}
      if (curEp!=null){
//          props.onStartPlay && props.onStartPlay(curSerie,curEp)
        await apiObjSetStorage({curSerie},"curEp",curEp.id)
        setStateKeyVal( "curPlay", newPlayObj)
      } else {
        apiObjGetStorage(newPlayObj,"curEp").then((value) => {
          if ((value==null)||(curSerie && curSerie.episodeList && curSerie.episodeList[value]==null)){
            value=0
            apiObjSetStorage(newPlayObj,"curEp",0)
          }
          if (curSerie && curSerie.episodeList && curSerie.episodeList[value]!=null){
            newPlayObj.curEp=curSerie.episodeList[value]
          }
//            props.onStartPlay && props.onStartPlay(curSerie,curSerie.episodeList[value])
          setStateKeyVal( "curPlay", newPlayObj)
        }).catch((err) => {
          console.error(err)
        })
      }
      const curSerId = curSerie.uniqueID || unique(curSerie.title)
      const lang = serieLang(topIdStr)
      const nType = serieNaviType(topIdStr)
      const langID = curSerie.langID
      const navHistEp = {...tmpEp,topIdStr,lang,langID}
      const navHist = {...state.navHist, [curSerId]: navHistEp}
      await updateStorage("navHist",navHist)
      await updateStorage("curSerId",curSerId)
      const curInx = tmpEp?.id
      const syncImgSrc = 
        ((curSerId === "uW.OBS.en") || (nType === "audioBible")) 
          ? updateImgBasedOnPos( nType, curEp, curInx, 0 ) 
          : ""
      const syncVerseText =
        (nType === "audioBible") 
      ? updateTextBasedOnPos( 0 ) 
      : ""
  setState(state => ({...state, navHist, syncImgSrc, syncVerseText, curSerId, curSerie, curEp: tmpEp}))
      // setState(state => ({...state, syncImgSrc, curSerId, curSerie, curEp: tmpEp}))
    }
  }

  const value = {
    state: {
      ...state,
      isPaused,
    },
    actions: {
      setState,
      startPlay,
      togglePlay,
      onStopPlaying,
      onPlaying,
      onFinishedPlaying,
      setIsPaused,
      skipToNextTrack,
    }
  }

  return (
    <MediaPlayerContext.Provider value={value}>
      {props.children}
    </MediaPlayerContext.Provider>
  )
}

//viewLibrary,

export {MediaPlayerContext, MediaPlayerProvider}

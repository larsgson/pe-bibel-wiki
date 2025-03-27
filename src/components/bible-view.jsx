import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Fab from '@mui/material/Fab'
import Home from '@mui/icons-material/Home'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import { rangeArray, pad, isEmptyObj } from '../utils/obj-functions'
import { 
  selectAudioBible,
  useSerie,
  serieLang,
  serieNaviType  
} from '../utils/dynamic-lang'
import { osisIconId, osisIconList } from '../constants/osisIconList'
import { getOsisChTitle, getChoiceTitle } from '../constants/osisChTitles'
import useBrowserData from '../hooks/useBrowserData'
import useMediaPlayer from "../hooks/useMediaPlayer"
import { naviSortOrder, chInBook,
          naviBooksLevel1, naviBooksLevel2, naviChapters } from '../constants/naviChapters'

const preNav = "https://img.bibel.wiki/navIcons/"

const SerieGridBar = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { classes, title, subtitle } = props
  return (
      <ImageListItemBar
        title={title}
        subtitle={subtitle}
      />
  )
}

const BibleView = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { size } = useBrowserData()
  const { curPlay, syncImgSrc } = useMediaPlayer()
  const isPlaying = !isEmptyObj(curPlay)
  const { t, i18n } = useTranslation()
  const { onExitNavigation, onStartPlay } = props
  const useSerieId = selectAudioBible(i18n.language)
  const [curLevel, setCurLevel] = useState(1)
  const [level0, setLevel0] = useState(useSerieId)
  const [level1, setLevel1] = useState(1)
  const [level2, setLevel2] = useState("")
  const [level3, setLevel3] = useState("")
  const [skipLevelList,setSkipLevelList] = useState([])
  const lng = i18n.language
  // ToDo !!! find a bibleBookList and use this here
  // eslint-disable-next-line no-unused-vars
  const getSort = (val) => naviSortOrder.indexOf(parseInt(val))
  const addSkipLevel = (level) => setSkipLevelList([...skipLevelList,level])

  // eslint-disable-next-line no-unused-vars
  const getOsisIcon = (osisId) => {
    const exceptionBook = ["1Sam","2Sam","1Kgs","2Kgs","1Chr","2Chr"]
    let bookNameEng = t(osisId, { lng: 'en' })
    if (exceptionBook.indexOf(osisId)>=0){
      bookNameEng = bookNameEng.slice(2,2+bookNameEng.length)
    }
    return bookNameEng.replace(/ /g,"-").toLowerCase()
  }

  const getChIcon = (key,lev1,lev2,bookObj,ch) => {
    let checkIcon = "000-" + pad(lev1)
    if (lev2!=null) checkIcon = "00-" + pad(lev1) + lev2
    let imgSrc
    let checkTitle
    const bk = (bookObj!=null)?bookObj.bk:null
    if (bk!=null){ // level 3
      const checkObj = osisIconList[bk]
      if (checkObj!=null){
        let useCh
        if (ch==null){
          const entry = Object.entries(checkObj)[0]
          useCh = entry[0]
          if (bk!=null){ // level 3
            const {beg,end} = bookObj
            if ((beg!=null)&&(end!=null)){
              useCh = Object.keys(checkObj).find(key => key>=beg)
            }
          }
        } else {
          if (checkObj[ch]!=null) useCh = ch
        }
        if (useCh!=null){
          const firstId = pad(parseInt(useCh))
          const firstEntry = checkObj[useCh][0]
          checkIcon = osisIconId[bk] + "_" + firstId + "_" + firstEntry
        }
      }
// Book Icon - To Do - to be added in the future
//    imgSrc = preBook +getOsisIcon(bk) +".png"
      checkTitle = t(bk, { lng })
    } else {
      checkTitle = t(checkIcon, { lng })
    }
    imgSrc = preNav +checkIcon +".png"
    let title = (ch!=null) ? getOsisChTitle(bk,ch,lng) : checkTitle
    let subtitle
    if (bk==null){ // level 1 and 2
      const checkStr = checkIcon + "-descr"
      subtitle = t(checkStr, { lng: serieLang[level0] })
      if (subtitle===checkStr) subtitle = ""
    } else if (ch==null){ // level 3
      const {beg,end} = bookObj
      if ((beg!=null)&&(end!=null)){
        subtitle = (beg===end) ? beg : beg + " - " + end
      }
      const choiceTitle = getChoiceTitle(bk,key+1,lng)
      if (choiceTitle!=null) {
        title += " " + subtitle
        subtitle = choiceTitle
      }
    } else { // level 4
      // const bookTitle = t(bk, { lng })
      const checkRegEx = /^(\d+)|(\D+)/g // separate numbers and letters
      let bookTitle = bk
      const matchesList = [...bk.matchAll(checkRegEx)]
      if ((matchesList!=null)&&(matchesList.length>1)) {
        bookTitle = `${matchesList[0][0]} ${matchesList[1][0]}`
      }
      if (title !== `${bk}.${ch}`) {
        subtitle = `${bookTitle} ${ch}`
      }
    }
    return {
      imgSrc,
      key,
      subtitle,
      title,
      isBookIcon: false
    }
  }

  // eslint-disable-next-line no-unused-vars
  const handleClick = (ev,id,_isBookIcon) => {
    if (curLevel===0) {
      setLevel0(id)
      setCurLevel(1)
    } else if (curLevel===1) {
      setLevel1(id)
      setCurLevel(2)
    } else if (curLevel===2) {
      setLevel2(id)
      if (naviChapters[level1][id].length===1){
        setLevel3(0)
        setCurLevel(4)
      } else setCurLevel(3)  
    } else if (curLevel===3) {
      setLevel3(id)
      setCurLevel(4)
    } else {
      const bookObj = {
        ...naviChapters[level1][level2][level3], 
        level1, 
        level2, 
        level3,
        title: "test"
      }
      const curSerie = {
        ...useSerie(lng,level0),
        title: `${bookObj.bk} ${id}`
      }
      onStartPlay(level0,curSerie,bookObj,id)
    }
  }

  const navigateUp = (level) => {
    if (skipLevelList.includes(level)) {
      navigateUp(level-1)
    } else {
      setCurLevel(level)
      if (level===0) setLevel0("audioBible")
    }
  }

  const navigateHome = () => {
    setCurLevel(1)
    setLevel1(1)
  }

  const handleReturn = () => {
    if ((curLevel===4)&&(naviChapters[level1][level2].length===1)){
      navigateUp(2)
    } else
    if (curLevel>0){
      navigateUp(curLevel-1)
    } else {
      onExitNavigation()
    }
  }
  const handleClose = () => {
    navigateUp(0)
  }
    
  let validIconList = []
  let validBookList = []
  if (curLevel>0){
    if (curLevel===1){
      let lastInx
      const curSerie = useSerie(lng,level0)
      const curList = (curSerie!=null && curSerie.bibleBookList) ? curSerie.bibleBookList : []
      Object.keys(naviBooksLevel1).sort((a,b)=>getSort(a)-getSort(b)
      ).forEach(iconInx => {
        const foundList = naviBooksLevel1[iconInx].filter(x => curList.includes(x))
        validBookList.push(...foundList)
        if (foundList.length>0){
          lastInx = iconInx
          validIconList.push(getChIcon(iconInx,iconInx))
        }
      })
      if (validIconList.length===1) {
        setLevel1(lastInx)
        setCurLevel(2)
        addSkipLevel(1)
        validIconList = []
        validBookList = []
      }
    }
    if (curLevel===2){
      let lastLetter
      const curSerie = useSerie(lng,level0)
      const curList = (curSerie!=null) ? curSerie.bibleBookList : []
      Object.keys(naviChapters[level1]).forEach(iconLetter => {
        const foundList = naviBooksLevel2[level1][iconLetter].filter(x => curList.includes(x))
        validBookList.push(...foundList)
        if (foundList.length>0) {
          lastLetter = iconLetter
          validIconList.push(getChIcon(iconLetter,level1,iconLetter))
        }
      })
      if (validIconList.length===1) {
        setLevel2(lastLetter)
        setCurLevel(3)
        addSkipLevel(2)
        validIconList = []
        validBookList = []
      }
    }
    if (curLevel===3){
      naviChapters[level1][level2].forEach((bookObj,i) => {
        validIconList.push(getChIcon(i,level1,level2,bookObj))
      })
    } else if (curLevel===4){
      const bookObj = naviChapters[level1][level2][level3]
      const {bk} = bookObj
      if (bk!=null){
        if (bookObj.beg==null) bookObj.beg = 1
        if (bookObj.end==null) bookObj.end = chInBook[bk]
        const {beg,end} = bookObj
        rangeArray(beg,end).forEach(ch => {
          validIconList.push(getChIcon(ch,level1,level2,bookObj,ch))
  //          validIconList.push(getChIcon(index here,level1,bookObj,ch,ch))
        })
      }
    }
  }
  let useCols = 3
  if (size==="xs") useCols = 2
  else if (size==="lg") useCols = 4
  else if (size==="xl") useCols = 5
  const naviType = serieNaviType(level0) || "audioBible"
  return (
    <div>
      {(naviType==="audioBible") && (!isPlaying) && (curLevel>2) && (
        <Fab
          onClick={navigateHome}
          // className={largeScreen ? classes.exitButtonLS : classes.exitButton}
          color="primary"
        >
          <Home/>
        </Fab>
      )}
      {(curLevel>1) && (!isPlaying) && (naviType==="audioBible") && (
        <Fab
          onClick={handleReturn}
          // className={largeScreen ? classes.exitButtonLS : classes.exitButton}
          color="primary"
        >
          <ChevronLeft />
        </Fab>
      )}
      {(naviType==="audioBible") && (!isPlaying) && (<ImageList
        rowHeight="auto"
        cols={useCols}
      >
        {validIconList.map(iconObj => {
          const {key,imgSrc,title,subtitle,isBookIcon} = iconObj
          return (
            <ImageListItem
              onClick={(ev) => handleClick(ev,key,isBookIcon)}
              key={key}
            >
              <img
                src={imgSrc}
                alt={title}/>
              <SerieGridBar
                title={title}
                subtitle={subtitle}
              />
            </ImageListItem>
          )
        })}
        </ImageList>
      )}
      {((naviType==="audioStories") || (naviType==="audioBible")) && (isPlaying) && (
      <>
        <ImageList
          rowHeight={"auto"}
          cols={1}
        >
          <ImageListItem
            onClick={(ev) => handleClick(ev,"1",false)}
            key="1"
          >
            <img src={syncImgSrc} />
          </ImageListItem>
        </ImageList>
        <Typography
          type="title"
        ><br/><br/></Typography>
      </>)}
    </div>
  )
}

export default BibleView

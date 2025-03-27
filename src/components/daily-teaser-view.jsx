import React from 'react'
import DailyTeaser from './daily-teaser'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useBrowserData from '../hooks/useBrowserData'
import { verseSec } from '../constants/TimeCodes'
import { verseSumCh } from '../constants/naviChaptersJohn'
import { gospelOfJohnObjBPlus } from '../constants/readingPlan'
import { differenceInCalendarDays } from 'date-fns'
import { useTranslation } from 'react-i18next'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const defaultBackgroundStyle = {
  height: 'auto',
  background: '#181818',
  padding: 0,
  color: 'whitesmoke',
}

const DailyTeaserView = ({onClick,lng}) => {
  const { t } = useTranslation()
  const curSerie = {...gospelOfJohnObjBPlus, language: lng}
  const nbrEpisodes = curSerie.episodeList.length
  const firstDateOfPlan = Date.parse(curSerie.beginDate)
  const dateNow = Date.now()
  const daysDiff = differenceInCalendarDays(dateNow,firstDateOfPlan)
  const daysSinceFirst = daysDiff <= nbrEpisodes ? daysDiff : nbrEpisodes
  const navigationDate = dateNow;

  const handlePlay = (inx,curSer,ep) => {
    if (startPlay!=null) {
      if (ep?.begin?.ch) { // Episodes with begin and end data
        const tmpEp = ep
        const begCh = tmpEp.begin.ch
        const begVerseNbr = ((begCh>1)?verseSumCh[begCh-2] : 0) + tmpEp.begin.v -1
        const endCh = tmpEp.end.ch
        const endVerseNbr = ((endCh>1)?verseSumCh[endCh-2] : 0) + tmpEp.end.v
        tmpEp.begTimeSec = verseSec[begVerseNbr]
        tmpEp.endTimeSec = verseSec[endVerseNbr]
        startPlay(undefined,inx,curSer,tmpEp)
      } else { // Assume that these are chapter episodes  
        ep.begTimeSec = verseSec[((ep?.id>0)?verseSumCh[ep?.id-1] : 0)]
        ep.endTimeSec = verseSec[verseSumCh[ep?.id]]
        if (ep) startPlay(undefined,inx,curSer,ep)
      }
    }
  }
 
  return (
    <div style={defaultBackgroundStyle}>
      <ThemeProvider theme={theme}>
        <div
          style={{
            maxWidth: 500,
            // float: props.float,
            marginTop: 2
          }}
        >
          <DailyTeaser
            lng={lng}
            curSerie={curSerie}
            navigationDate={navigationDate}
            daysSinceFirst={daysSinceFirst}
            firstDateOfPlan={firstDateOfPlan}  
            onClickPlay={onClick}
          />
        </div>
      </ThemeProvider>
    </div>
  )
}

export default DailyTeaserView

import * as React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import { useState, Suspense } from 'react'
import ISO6391 from 'iso-639-1'
import { getEngLangName, langName, navLangList } from '../constants/languages'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import Typography from '@mui/material/Typography'
import { countryData } from '../constants/countries'
import useBrowserData from '../hooks/useBrowserData'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

const LangGridBar = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { classes, title, subtitle } = props
  return (
      <ImageListItemBar
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        // p: 1,
        // m: 1,
      }}
        // title={<Typography sx={{ fontSize: '12px' }}>{title}</Typography>}
        title={title}
        subtitle={subtitle}
      />
  )
}

const capitalizeFirstLetter = ([ first='', ...rest ]) => [ first.toUpperCase(), ...rest ].join('')

const getLangOptionsObj = (lng) => {
  return {
    value: lng,
    label: lng === "en" ? `${langName[lng]}` :  `${langName[lng]} - ${getEngLangName(lng)}`
  }
}

const navLangOptions = navLangList.map((lng) => getLangOptionsObj(lng))

const langsList = countryData["in"]?.langsInCountry

const availableLangOptions = langsList.map((lng) => getLangOptionsObj(lng))

export default function SettingsView() {
  const { t, i18n } = useTranslation();
  const { size } = useBrowserData()
  let useCols = 3
  if (size==="xs") useCols = 2
  else if (size==="lg") useCols = 4
  else if (size==="xl") useCols = 5
  return (
    <div className="App">
      <header className="App-header">
        <div>Navigation Language</div>
        <Autocomplete
          id="controlled-demo"
          disablePortal
          options={navLangOptions}
          getOptionDisabled={(option) =>option?.value !== "en"}
          sx={{ 
            width: 300,
            backgroundColor: "lightgrey"
          }}
          renderInput={(params) => <TextField {...params} label="Language" />}
          value={getLangOptionsObj("en")}
          onChange={(event, newValue) => {
            i18n.changeLanguage(newValue)
          }}
        />
        <br/>
        <br/>
        <div>Available Languages</div>
        <br/>
        <Autocomplete
          id="controlled-demo"
          disablePortal
          options={availableLangOptions}
          getOptionDisabled={(option) =>option?.value === i18n.language}
          sx={{ 
            width: 300,
            backgroundColor: "lightgrey"
          }}
          renderInput={(params) => <TextField {...params} label="Language" />}
          value={getLangOptionsObj(i18n.language)}
          onChange={(event, newValue) => {
            i18n.changeLanguage(newValue)
          }}
        />
        <br/>
        <ImageList
          rowHeight={120}
          cols={useCols}
          gap={9}
          sx={{overflowY: 'clip'}}
        >
          {langsList.map((lng) => {
            const nativeStr = langName[lng]
            const subtitle = getEngLangName(lng)
            let title = `${nativeStr}`
            if (lng.length>3) {
              const countryCode = lng.slice(3,5)
              title = `${nativeStr} (${countryCode})`
            }
            const shortLang = nativeStr.slice(0,2)
            const isSelected = i18n.language === lng
            const key = lng
            const imgSrc = countryData["in"]?.pics4langs[lng] 
            const bkgdColor = `#${countryData["in"]?.color4langs[lng]}`
            const isBookIcon = false
            return (
              <span key={key}>
                {imgSrc ? (
                  <ImageListItem onClick={() => i18n.changeLanguage(lng)}>
                    <img src={imgSrc} alt={title} style={{height: "100%"}}/>
                    <LangGridBar title={title} subtitle={subtitle}/>
                  </ImageListItem>
                ) : (
                  <ImageListItem onClick={() => i18n.changeLanguage(lng)}>
                    <Typography 
                      sx={{ 
                        fontSize: '40px',
                        backgroundColor: bkgdColor
                      }}>
                      {shortLang}
                    </Typography>
                    <Typography 
                      sx={{ 
                        paddingTop: '12px',
                        fontSize: '15px',
                        backgroundColor: '#444'
                      }}>
                      {title}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '12px',
                        backgroundColor: '#444',
                        paddingBottom: '8px',
                      }}>
                      {subtitle}
                    </Typography>
                  </ImageListItem>
                )}
              </span>
            )}
          )}
        </ImageList>
        <div 
        style={{
          paddingBottom: 30,
          // m: 1,
        }}
      >
        <br/>
      {/* <button onClick={() => window.open("https://github.com/larsgson/bibel-wiki/blob/main/roadmap.md", "_blank")}>
        Road map
      </button> */}
      </div>

      </header>
    </div>
  );
}

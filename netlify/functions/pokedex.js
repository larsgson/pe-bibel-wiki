import fetch from 'node-fetch'

export const handler = async (event, context) => {
  const eventBody = JSON.parse(event.body)
  const POKE_API = 'https://pokeapi.co/api/v2/pokedex/' + eventBody.region

  const response = await fetch(POKE_API)
  const data = await response.json()
  const checkNDev = (process?.env?.NETLIFY_DEV==="true")
  console.log(process?.env?.NETLIFY_DEV)
  console.log(process?.env?.SITE_ID)
  const apiKey = import.meta.env.VITE_BB_KEY
  console.log(apiKey)

  return {
    statusCode: 200,
    body: checkNDev ? JSON.stringify({ siteId: process?.env?.SITE_ID, env: process?.env }) : JSON.stringify({
      pokemon: data.pokemon_entries
    })
  }
}

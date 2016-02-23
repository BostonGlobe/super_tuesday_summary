import { primaries2016Dates, standardize, Candidate } from 'election-utils'
import getJSON from 'get-json-lite'
import { parse } from 'query-string'
import urlManager from './urlManager'

const test = true

const mergeDataWithRaces = function(races) {
	const withData = races.map(race => {

	})
}

const onDataResponse = function(response) {
	const parsed = parse(window.location.search)
	const racesList = parsed.races.split(',')
	const races = racesList.map(race => {
		const split = race.split('-')
		const stateAbbr = split[0].toUpperCase()
		const party = split[1].toUpperCase()
		
		return primaries2016Dates.find(p => {
			const sameState = p.stateAbbr === stateAbbr
			const sameParty = p.party.toLowerCase() === standardize.expandParty(party).toLowerCase()
			return sameState && sameParty
		})
	})

	mergeDataWithRaces(races)
}

const onDataError = function(error) {
	console.error(error)
}

const init = function() {
	const date = '2016-03-01'
	const url = urlManager({level: 'state', date, test})
	getJSON(url, onDataResponse, onDataError)
}

init()

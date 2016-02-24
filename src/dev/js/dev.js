import { primaries2016Dates, standardize, Candidate, Candidates } from 'election-utils'
import getJSON from 'get-json-lite'
import { parse } from 'query-string'
import periodic from 'periodic.js'

import urlManager from './urlManager'
import dom from './dom'

const test = true

function toPercent(x, shorten) {

	const decimalPlaces = shorten ? 0 : 1

	if (x === 1) {

		return '100'

	} else if (x === 0) {

		return '0'

	}

	return (100 * x).toFixed(decimalPlaces).toString()

}

function findMatchingRace(race, racesData) {

	return racesData.find(datum => {

		const party = standardize.expandParty(datum.party).toLowerCase()
		const stateAbbr = datum.reportingUnits[0].statePostal.toLowerCase()
		return party === race.party.toLowerCase() && stateAbbr === race.stateAbbr.toLowerCase()

	})

}

function getTopTwoCandidates(raceData) {

	const candidates = raceData.reportingUnits[0].candidates
	const sorted = Candidates.sort(candidates).slice(0, 2)

	const totalVotes = Candidates.getVoteCount(candidates)

	return sorted.map(candidate => {

		const { first, last, voteCount } = candidate
		const percent = `${toPercent(voteCount / totalVotes)}%`
		const isWinner = Candidate.isWinner(candidate)

		return { first, last, percent, isWinner }

	})

}

function mergeDataWithRaces(races, racesData) {

	return races.map(race => {

		const matchingRaceData = findMatchingRace(race, racesData)
		const topTwo = getTopTwoCandidates(matchingRaceData)
		const output = {
			stateAbbr: race.stateAbbr,
			party: race.party,
			raceType: race.raceType,
			candidates: topTwo,
		}

		return output

	})

}

function getRaceData(races) {

	return races.map(race => {

		const split = race.split('-')
		const stateAbbr = split[0].toUpperCase()
		const party = split[1].toUpperCase()

		return primaries2016Dates.find(p => {

			const sameState = p.stateAbbr === stateAbbr
			const sameParty = p.party.toLowerCase() === standardize.expandParty(party).toLowerCase()
			return sameState && sameParty

		})

	})

}

function validateResponse(response) {

	return response && response.races && response.races.length

}

function onDataError(error) {

	console.error(error)

}

function onDataResponse(races, response) {

	if (validateResponse(response)) {

		// combine candidates with race info
		const withCandidates = mergeDataWithRaces(races, response.races)

		// create and update candidate elements
		dom.updateCandidates(withCandidates)

	} else {

		onDataError('empty response')

	}

}

function getRacesFromParams() {

	const parsed = parse(window.location.search)
	return parsed.races.split(',')

}

function init() {

	// get race info from election-utils based on query params
	const arr = getRacesFromParams()
	const races = getRaceData(arr)

	// setup dom elements for each race
	dom.createRaces(races)

	// fetch race results handle response
	const date = '2016-03-01'
	const level = 'state'
	const url = urlManager({ level, date, test })

	periodic({ duration: 30000, callback: done => {

		getJSON(url, response => {

			onDataResponse(races, response)
			done()

		}, onDataError)

	}, runImmediately: true })

}

init()

import { primaries2016Dates, primaries2016Candidates, standardize, Candidate, Candidates } from 'election-utils'
import getJSON from 'get-json-lite'
import { parse } from 'query-string'
import periodic from 'periodic.js'
import orderBy from 'lodash.orderby'

import urlManager from './urlManager'
import dom from './dom'

function toPercent(x, shorten) {

	const decimalPlaces = shorten ? 0 : 1

	if (x === 1) {

		return '100'

	} else if (x === 0) {

		return '0'

	} else if (isNaN(x)) {

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

	// filter out not real candidates
	const filtered = candidates.filter(c => primaries2016Candidates.find(c2 => c2.last === c.last.toLowerCase()))

	// sort by votes, ballot order, active
	const withActive = filtered.map(c => {
		const cand = primaries2016Candidates.find(c2 => c2.last === c.last.toLowerCase())

		c.active = cand.suspendedDate ? 0 : 1
		return c

	})

	const ordered = orderBy(withActive, ['voteCount', 'active', 'ballotOrder'], ['desc', 'desc', 'asc'])

	const totalVotes = Candidates.getVoteCount(candidates)

	// return top two with percents 
	return ordered.map(candidate => {

		const { first, last, voteCount } = candidate

		const percent = `${toPercent(voteCount / totalVotes)}%`
		const isWinner = Candidate.isWinner(candidate)

		return { first, last, percent, isWinner }

	}).slice(0, 2)

}

function mergeDataWithRaces(states, racesData) {

	return states.map(state => {

		const races = state.races.map(race => {

			const matchingRaceData = findMatchingRace(race, racesData)
			const topTwo = getTopTwoCandidates(matchingRaceData)

			return {
				stateAbbr: race.stateAbbr,
				party: race.party,
				raceType: race.raceType,
				candidates: topTwo,
			}

		})

		const name = state.name

		return { name, races }

	})

}

function getRaceData(states) {

	const date = '2016-03-01'

	// make sure state exists and on super tuesday
	const filtered = states.filter(state => {

		return primaries2016Dates.find(r => r.stateAbbr.toLowerCase() === state && r.date === date)

	})

	return filtered.map(state => {

		const races = primaries2016Dates.filter(race => race.stateAbbr.toLowerCase() === state)
		const name = standardize.expandState(state)

		return { name, races }

	})

}

function validateResponse(response) {

	return response && response.races && response.races.length

}

function onDataError(error) {

	console.error(error)

}

function onDataResponse(states, response) {

	if (validateResponse(response)) {

		// combine candidates with race info
		const withCandidates = mergeDataWithRaces(states, response.races)

		// create and update candidate elements
		dom.updateCandidates(withCandidates)

	} else {

		onDataError('empty response')

	}

}

function getStatesFromParams() {

	const parsed = parse(window.location.search)
	const states = parsed.states.split(',')
	return states.map(s => s.toLowerCase())

}

function init() {

	if (process.env.test) document.querySelector('.ap-test').classList.remove('hide')

	// get race info from election-utils based on query params
	const states = getRaceData(getStatesFromParams())

	// setup dom elements for each race
	dom.setupDOM(states)

	// create both drop down menus
	const parent1 = document.querySelector('.more-races.above')
	const parent2 = document.querySelector('.more-races.below')
	dom.setupDropdown(parent1, '2016-03-01')
	dom.setupDropdown(parent2, '2016-03-01')

	// fetch race results handle response
	const date = '2016-03-01'
	const level = 'state'
	const url = urlManager({ level, date })
	const duration = 30 * 1000
	const displaySelector = '.update-text'

	// updater timer
	periodic({ duration, displaySelector, callback: done => {

		const element = document.querySelector(displaySelector)
		element.innerHTML = 'Updating...'

		getJSON(url, response => {

			onDataResponse(states, response)
			done()

		}, onDataError)

	}, runImmediately: true })

}

init()

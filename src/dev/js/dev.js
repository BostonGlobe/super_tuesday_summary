import { primaries2016Dates, standardize, Candidate, Candidates } from 'election-utils'
import getJSON from 'get-json-lite'
import { parse } from 'query-string'
import urlManager from './urlManager'

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

function createCandidateElement(candidate) {

	const className = candidate.isWinner ? 'is-winner' : ''

	return `
		<li class='candidate ${className}'>
			<p class='candidate-name'>${candidate.last}</p>
			<p class='candidate-percent'>${candidate.percent}</p>
		</li>
	`.trim()

}

function createHTML(race) {

	return `
		<div class='race'>
			<p class='race-title'>${race.state} ${race.party} ${race.raceType}</p>
			<ul class='race-candidates'>
				${race.candidates.map(createCandidateElement).join('')}
			</ul>
		</div>
	`.trim()

}

function displayRaces(races) {

	const racesHTML = races.map(createHTML)

	const html = racesHTML.join('')

	const container = document.querySelector('.race-container')

	container.innerHTML = html
}

function mergeDataWithRaces(races, racesData) {

	const withCandidates = races.map(race => {

		const matchingRaceData = findMatchingRace(race, racesData)
		const topTwo = getTopTwoCandidates(matchingRaceData)
		const output = {
			state: standardize.expandState(race.stateAbbr),
			party: race.party,
			raceType: race.raceType,
			candidates: topTwo,
		}

		return output

	})

	displayRaces(withCandidates)
}

function getRaceData(raceList) {

	return raceList.map(race => {

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

function onDataResponse(response) {

	if (response && response.races && response.races.length) {

		const parsed = parse(window.location.search)
		const raceList = parsed.races.split(',')
		const races = getRaceData(raceList)

		mergeDataWithRaces(races, response.races)

	} else {

		console.error('no data in response')

	}

}

function onDataError(error) {

	console.error(error)

}

function init() {

	const date = '2016-03-01'
	const url = urlManager({ level: 'state', date, test })
	getJSON(url, onDataResponse, onDataError)

}

init()

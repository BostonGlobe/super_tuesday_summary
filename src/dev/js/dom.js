import { standardize } from 'election-utils'

const container = document.querySelector('.race-container')

function getRaceClassName(race) {

	return `${race.stateAbbr}-${race.party}-${race.raceType}`.toLowerCase().split(' ').join('-')

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

function createRaceElement(race) {

	const className = getRaceClassName(race)

	return `
		<div class='race ${className}'>
			<p class='race-title'>
				${standardize.expandState(race.stateAbbr)} ${race.party} ${race.raceType.toLowerCase()}
			</p>
			<ul class='race-candidates'></ul>
		</div>
	`.trim()

}

function createRaces(races) {

	const html = races.map(createRaceElement).join('')
	container.innerHTML = html

}

function createCandidates(races) {

	races.map(race => {

		const html = race.candidates.map(createCandidateElement).join('')
		const className = getRaceClassName(race)
		const sel = `.${className} ul`
		const ul = document.querySelector(sel)

		ul.innerHTML = html

	})

}

export default { createRaces, createCandidates }

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

function candidatesShifted(race) {

	const className = getRaceClassName(race)
	const elements = document.querySelectorAll(`.${className} ul li`)

	if (elements.length) {

		return race.candidates.reduce((previous, current, index) => {

			const last = elements[index].querySelector('.candidate-name').textContent
			return previous || last.toLowerCase() === current.last

		}, false)

	}

	return false

}

function updateCandidates(races) {

	races.map(race => {

		// check if the two candidates are the same and in same position
		const shifted = candidatesShifted(race)
		console.log(shifted)

		const html = race.candidates.map(createCandidateElement).join('')
		const className = getRaceClassName(race)
		const sel = `.${className} ul`
		const ul = document.querySelector(sel)

		ul.innerHTML = html

	})

}

export default { createRaces, updateCandidates }

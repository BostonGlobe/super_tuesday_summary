const container = document.querySelector('.race-container')

function safeString(str) {

	return str.replace(/W+/g, '').toLowerCase()

}

function getRaceClassName(race) {

	return `race-${race.stateAbbr}-${race.party}-${race.raceType}`.toLowerCase().split(' ').join('-')

}

function createCandidateElement(candidate) {

	const winner = candidate.isWinner ? 'is-winner' : ''

	return `
		<li class='candidate candidate-${safeString(candidate.last)} ${winner}'>
			<p class='candidate-name'>${candidate.last}</p>
			<p class='candidate-percent'>${candidate.percent}</p>
		</li>
	`.trim()

}

function createRaceElement(race) {

	const className = getRaceClassName(race)
	return `
		<ul class='race ${className} ${safeString(race.party)} transparent'></ul>
	`.trim()

}

function createStateElement(state) {

	return `
		<div class='state state-${safeString(state.name)}'>
			<p class='state-name'>${state.name}</p>
			<ul class='state-races'>${state.races.map(createRaceElement).join('')}</ul>
		</div>
	`.trim()

}

function setupDOM(states) {

	const html = states.map(createStateElement).join('')
	container.innerHTML = html

}

function candidatesShifted(race) {

	const className = getRaceClassName(race)
	const elements = document.querySelectorAll(`.${className} li`)

	if (elements.length) {

		return race.candidates.reduce((previous, current, index) => {

			const last = elements[index].querySelector('.candidate-name').textContent
			return previous || last.toLowerCase() === current.last

		}, false)

	}

	return true

}

function injectValues(race) {

	const className = getRaceClassName(race)
	const ul = document.querySelector(`.${className}`)

	const update = race.candidates.reduce((previous, candidate) => {

		const sel = `.candidate-${safeString(candidate.last)} .candidate-percent`
		const el = ul.querySelector(sel)
		const previousPercent = el.textContent

		if (previous || previousPercent !== candidate.percent) {

			el.textContent = candidate.percent
			return true

		}

		return false

	}, false)

	if (update) {

		ul.classList.add('update')

	} else {

		ul.classList.remove('update')

	}

}

function createNewCandidateElements(race) {

	const className = getRaceClassName(race)
	const sel = `.${className}`
	const ul = document.querySelector(sel)

	ul.classList.add('transparent')

	const html = race.candidates.map(createCandidateElement).join('')

	ul.innerHTML = html

	// remove transparency
	setTimeout(() => ul.classList.remove('transparent'), 30)

}

function updateCandidates(states) {

	states.map(state => {

		state.races.map(race => {

			const shifted = candidatesShifted(race)

			if (shifted) createNewCandidateElements(race)

			else injectValues(race)

		})

	})

}

export default { setupDOM, updateCandidates }

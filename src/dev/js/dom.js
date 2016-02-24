const container = document.querySelector('.race-container')

function getRaceClassName(race) {

	return `race-${race.stateAbbr}-${race.party}-${race.raceType}`.toLowerCase().split(' ').join('-')

}

function createCandidateElement(candidate) {

	const winner = candidate.isWinner ? 'is-winner' : ''

	return `
		<li class='candidate candidate-${candidate.last.replace(/W+/g, '')} ${winner} transparent'>
			<p class='candidate-name'>${candidate.last}</p>
			<p class='candidate-percent'>${candidate.percent}</p>
		</li>
	`.trim()

}

function createRaceElement(race) {

	const className = getRaceClassName(race)
	return `
		<ul class='race ${className} ${race.party.toLowerCase()}'></ul>
	`.trim()

}

function createStateElement(state) {

	return `
		<div class='state state-${state.name}'>
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

	race.candidates.map(candidate => {

		const sel = `li.candidate-${candidate.last.replace(/W+/g, '')} .candidate-percent`
		const el = ul.querySelector(sel)
		const previousPercent = el.textContent

		if (previousPercent === candidate.percent) {

			el.classList.add('same')
			el.classList.remove('updated')

		} else {

			el.textContent = candidate.percent
			el.classList.add('updated')
			el.classList.remove('same')

		}

	})

}

function createNewCandidateElements(race) {

	const html = race.candidates.map(createCandidateElement).join('')
	const className = getRaceClassName(race)
	const sel = `.${className}`
	const ul = document.querySelector(sel)
	ul.innerHTML = html

	// remove transparency
	setTimeout(() => {

		const li = ul.querySelectorAll('li')
		for (let i = 0; i < li.length; i++) {

			li[i].classList.remove('transparent')

		}

	}, 30)

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

import { standardize, primaries2016Dates } from 'election-utils'

const container = document.querySelector('.race-container')

function whichTransitionEvent (){
	const el = document.createElement('fakeelement');
	const transitions = {
		'transition':'transitionend',
		'OTransition':'oTransitionEnd',
		'MozTransition':'transitionend',
		'WebkitTransition':'webkitTransitionEnd'
	};

	for (let t in transitions){
		if (el.style[t] !== undefined){
			return transitions[t];
		}
	}
}

function createUrl({ stateAbbr, party, raceType }) {

	const stateName = standardize.expandState(stateAbbr)
	const stateNameLink = stateName.split(' ').join('-').toLowerCase()
	const partyLink = party.toLowerCase()
	const raceLink = raceType.toLowerCase()
	const base = '//apps.bostonglobe.com/election-results/2016'

	return `${base}/${raceLink}/${partyLink}/${stateNameLink}`

}

function goToRacePage() {

	window.open(this.value, '_blank')

}

function setupDropdown(parent, date) {

	// reduce to races on given date
	const races = primaries2016Dates.filter(race => race.date === date)

	const options = races.map(race => {

		const url = `${createUrl(race)}?p1=BG_super_tuesday_dropdown`
		const state = standardize.expandState(race.stateAbbr)
		const party = standardize.collapseParty(race.party)
		return `<option value='${url}'>${state} (${party})</option>`

	})

	const html = `
		<select type='dropdown' size='1' class='nav-select'>
			<option value=''>More races</option>
			${options.join('')}
		</select>
	`.trim()

	parent.innerHTML = html

	const el = document.querySelector('.more-races .nav-select')
	el.addEventListener('change', goToRacePage)

}

function safeString(str) {

	return str.replace(/\W+/g, '').toLowerCase()

}

function getRaceClassName(race) {

	return `race-${race.stateAbbr}-${race.party}-${race.raceType}`.toLowerCase().split(' ').join('-')

}

function getReportingClassName(race) {

	return `reporting-${race.stateAbbr}-${race.party}`.toLowerCase().split(' ').join('-')

}

function createCandidateElement(candidate) {

	const winner = candidate.isWinner ? 'is-winner' : ''
	const className = safeString(candidate.last)

	return `
		<li class='candidate candidate-${className} ${winner}'>
			<p class='candidate-name'>${candidate.last}</p>
			<p class='candidate-percent'>${candidate.percent}</p>
		</li>
	`.trim()

}

function createRaceElement(race) {

	const className = getRaceClassName(race)
	const reportingClassName = getReportingClassName(race)
	const url = `${createUrl(race)}?p1=BG_super_tuesday_racelink`
	return `
		<a class='race-link ${race.party.toLowerCase()}' href='${url}' target='_blank'>
			<ul class='race ${className}'>
				<p class='loading'>Loading data...</p>
			</ul>
		</a>
		<p class='race-reporting ${reportingClassName}'></p>
	`.trim()

}

function createStateElement(state) {

	return `
		<div class='state state-${safeString(state.name)}'>
			<p class='state-name'>${state.name}</p>
			<div class='state-races'>${state.races.map(createRaceElement).join('')}</div>
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

		if (!el) return false

		const previousPercent = el.textContent

		if (previous || previousPercent !== candidate.percent) {

			el.textContent = candidate.percent
			return true

		}

		return false

	}, false)

	// const update = Math.random() < 0.5

	if (update) {

		ul.classList.add('updated')

		const transition = whichTransitionEvent()

		const completed = () => {

			ul.removeEventListener(transition, completed)
			ul.classList.remove('updated')

		}

		ul.addEventListener(transition, completed)

	} else {

		ul.classList.remove('updated')

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

function updateReporting(race) {

	const className = getReportingClassName(race)
	const sel = `.${className}`
	const el = document.querySelector(sel)
	el.textContent = `${race.reporting}% reporting`

}

function updateCandidates(states) {

	states.forEach(state => {

		state.races.forEach(race => {

			// update reporting
			updateReporting(race)

			const shifted = candidatesShifted(race)

			if (shifted) createNewCandidateElements(race)

			else injectValues(race)

		})

	})

}

export default { setupDOM, setupDropdown, updateCandidates }

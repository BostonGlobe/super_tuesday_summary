import { primaries2016Dates, standardize, Candidate } from 'election-utils'
import getJSON from 'get-json-lite';
// import { parse } from 'query-string';
import urlManager from './urlManager'

const test = true;

const onDataResponse = function(response) {
	console.log(response)
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

export default function urlManager({ level, date, test }) {

	// construct the api url
	const baseUrl = test
		? '//dev.apps.bostonglobe.com/electionapi/elections/'
		: '//www.bostonglobe.com/electionapi/elections/'

	const url = `${baseUrl}${date}?&level=${level}&officeID=P`

	return url

}

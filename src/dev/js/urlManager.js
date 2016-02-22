export default function urlManager(opts) {

	const { level, date, test } = opts
	
	// construct the api url
	const baseUrl = test ? '//dev.apps.bostonglobe.com/electionapi/elections/' : '//www.bostonglobe.com/electionapi/elections/'

	const url = `${baseUrl}${date}?&level=${level}`

	return url
}

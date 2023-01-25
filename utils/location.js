const { default: axios } = require("axios")
const fetch = require("node-fetch")

async function getAddressByCoordinates(coords) {
	let res = await getAddressFromDadata(coords)
	if (!res) {
		res = await getAddressFromYandex(coords)
	}

	return res
}

const yandexAPI = process.env.YandexAPIKEY
const urlYandex = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexAPI}&format=json&geocode=`
async function getAddressFromYandex(coords) {
	const prepCoords = coords.reverse().join(",")
	const { data } = await axios(`${urlYandex}${prepCoords}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
	const result =
		data?.response?.GeoObjectCollection?.featureMember[0]?.GeoObject
			?.metaDataProperty?.GeocoderMetaData?.Address?.formatted

	return result
}

const urlDadata =
	"https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address"
const dadataToken = process.env.DadataAPIKEY
async function getAddressFromDadata(coords) {
	const query = { lat: coords[0], lon: coords[1] }

	const options = {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: "Token " + dadataToken,
		},
		body: JSON.stringify(query),
	}

	const response = await fetch(urlDadata, options)
	const data = await response.json()

	return data?.suggestions?.[0]?.unrestricted_value
}

module.exports = { getAddressByCoordinates }

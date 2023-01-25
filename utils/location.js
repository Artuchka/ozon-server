const { default: axios } = require("axios")

const api_key = "45d95055-c372-4cc1-9468-637658d3e41a"
async function getAddressByCoordinates(coords) {
	const res = await getAddressFromYandex(coords)
	// if(!res) {
	// 	await getAddressFromDadata(coords)
	// }

	return res
}

async function getAddressFromYandex(coords) {
	const prepCoords = coords.reverse().join(",")
	const { data } = await axios(
		`https://geocode-maps.yandex.ru/1.x/?apikey=${api_key}&format=json&geocode=${prepCoords}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		}
	)
	const result =
		data?.response?.GeoObjectCollection?.featureMember[0].GeoObject
			?.metaDataProperty?.GeocoderMetaData?.Address?.formatted
	console.log({ result })
	return result
}
// async function getAddressFromDadata (coords)  {
// 	const prepCoords = coords.reverse().join(",")
// 	const { data } = await axios(
// 		`https://geocode-maps.yandex.ru/1.x/?apikey=${api_key}&format=json&geocode=${prepCoords}`,
// 		{
// 			method: "GET",
// 			headers: { "Content-Type": "application/json" },
// 		}
// 	)
// 	const result = (
// 		data?.response?.GeoObjectCollection?.featureMember[0].GeoObject
// 			?.metaDataProperty?.GeocoderMetaData?.Address?.formatted
// 	)
// 	console.log({result});
// 	return result
// }

module.exports = { getAddressByCoordinates }

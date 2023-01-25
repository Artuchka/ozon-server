const { default: axios } = require("axios")

const api_key = "45d95055-c372-4cc1-9468-637658d3e41a"
const getAddressByCoordinates = async (coords) => {
	const prepCoords = coords.reverse().join(",")
	console.log({ prepCoords })
	const { data } = await axios(
		`https://geocode-maps.yandex.ru/1.x/?apikey=${api_key}&format=json&geocode=${prepCoords}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		}
	)
	const { name, description } =
		data?.response?.GeoObjectCollection?.featureMember[0].GeoObject

	// console.log({ name, description })
	return { name, description }
}

module.exports = { getAddressByCoordinates }

mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v10",
    center: crag.geometry.coordinates,
    zoom: 7,
});
new mapboxgl.Marker().setLngLat(crag.geometry.coordinates).addTo(map);

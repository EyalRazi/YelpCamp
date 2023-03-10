mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "cluster-map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [
    foundCampgrounds[0].geometry.coordinates[0],
    foundCampgrounds[0].geometry.coordinates[1],
  ],
  zoom: 5,
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

map.on("load", function () {
  map.addSource("foundCampgrounds", {
    type: "geojson",
    data: foundCampgrounds,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "foundCampgrounds",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#00BCD4",
        10,
        "#2196F3",
        30,
        "#3F51B5",
      ],
      "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "foundCampgrounds",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "foundCampgrounds",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  map.on("click", "clusters", function (e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("foundCampgrounds")
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  map.on("mouseenter", "clusters", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", function () {
    map.getCanvas().style.cursor = "";
  });
});

for (let campground of foundCampgrounds) {
  new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({
        offset: 25,
      }).setHTML(
        `<h4>${campground.title}</h4><a href="${campground._id}">Info</a>`
      )
    )
    .addTo(map);
}

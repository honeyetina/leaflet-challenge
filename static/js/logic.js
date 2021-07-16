function createMap(earthquakes, color_mag, depth_extreme) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });
  
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightmap
    };
  
    // Create an overlayMaps object to hold the earthquakes layer
    var overlayMaps = {
      "Earthquakes": earthquakes
    };
  
    // Create the map object with options
    var map = L.map("map", {
      center: [40.73, -74.0059],
      zoom: 3,
      layers: [lightmap, earthquakes]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    console.log(color_mag);
    console.log(depth_extreme);
    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var labels = [];
        console.log(labels);
        // Add min & max
        var legendInfo = "<h1>Earthquake Depth</h1>" +
        "<div class=\"labels\">" +
            "<div class=\"min\">" + depth_extreme[0] + "</div>" +
            "<div class=\"max\">" + depth_extreme[1] + "</div>" +
        "</div>";

        div.innerHTML = legendInfo;

        color_mag.forEach(function(color_mag_i) {
            labels.push("<li style=\"background-color: " + color_mag_i + "\"></li>");
        });
        console.log(labels);
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding legend to the map
    legend.addTo(map);

  }
  
  function createMarkers(response) {

    // Pull the "features" property off of response.data
    var features = response.features;
  
    // Initialize an array to hold bike markers
    var earthquakeMarkers = [];
    
    // Define the color for different mag
    var numberOfItems = 10;
    var rainbow = new Rainbow(); 
    rainbow.setNumberRange(1, numberOfItems);
    rainbow.setSpectrum('yellow', 'black');
    var color_mag = [];
    for (var i = 1; i <= numberOfItems; i++) {
        color_mag.push('#' + rainbow.colourAt(i))
    }

    var depth_min = 10000;
    var depth_max = -1;
    for (var index = 0; index < features.length; index++) {
        var feature = features[index];
        if (feature.geometry.coordinates[2] > depth_max) {
            depth_max = feature.geometry.coordinates[2]
        }
        if (feature.geometry.coordinates[2] < depth_min) {
            depth_min = feature.geometry.coordinates[2]
        }
    }
    var depth_extreme = [depth_min, depth_max];
    let colorGradient = depth => color_mag[Math.floor((depth - depth_min) / (depth_max - depth_min) * numberOfItems)]

    // Loop through the features array
    for (var index = 0; index < features.length; index++) {
      var feature = features[index];
  
      // For each feature, create a marker and bind a popup with the feature's name
      var earthquakeMarker = L.circle([feature.geometry.coordinates[0], feature.geometry.coordinates[1]], {
        color: "black",
        fillColor: colorGradient(feature.geometry.coordinates[2]),
        fillOpacity: 0.5,
        radius: feature.properties.mag * 50000
      })
        .bindPopup("<h3>" + feature.properties.title + "<h3><h3>Mag: " + feature.properties.mag + "</h3>");
  
      // Add the marker to the earthquakeMarkers array
      earthquakeMarkers.push(earthquakeMarker);
    }
  
    // Create a layer group made from the bike markers array, pass it into the createMap function
    createMap(L.layerGroup(earthquakeMarkers), color_mag, depth_extreme);
  }
  
  
  // Perform an API call to the Citi Bike API to get feature information. Call createMarkers when complete
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(createMarkers);
  
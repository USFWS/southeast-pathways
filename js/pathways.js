$(function() {
  var geojson,
      map,
      template = _.template($('script.template').html()),
      $list = $('.student-list'),
      $search = $('input[type=search]'),
      $clear = $('.clear');

  $clear.on('click', function() {
    $search.val('');
    template({ students: geojson.features });
    $search.trigger('keyup');
  });

  getStudents().then(function(data) {
    geojson = data;
    $list.append(template({ students: geojson.features }));
    registerHandler($search, geojson, template, $list);
    buildMap(geojson, $search, $list, template);
  });
});

function getStudents() {
  return $.getJSON('https://rawgit.com/USFWS/southeast-pathways/master/data/students.json');
}

function registerHandler(search, geojson, template, list) {
  var current = [];
  search.on('keyup', function() {
    var query = search.val().toLowerCase();
    var filtered = _.filter(geojson.features, function(student){
      var s = student.properties,
        office = s.office.toLowerCase(),
        name = s.name.toLowerCase();
        city = s.city.toLowerCase();
        state = s.state.toLowerCase();
        return (office.indexOf(query) > -1 || name.indexOf(query) > -1 || city.indexOf(query) > -1 || state.indexOf(query) > -1);
    });
    if (!_.isEqual(current, filtered)) {
      current = _.clone(filtered);
      list.empty().append(template({ students: filtered }));
    }
  });
}

function buildMap(geojson, search, list, template) {
  var map = L.map('map', {
    scrollWheelZoom: false
  });
  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  var icon = L.AwesomeMarkers.icon({
    icon: 'user',
    prefix: 'fa'
  });

  var markers = L.geoJson(geojson, {
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {icon: icon});
    },
    onEachFeature: function(feature, layer) {
      layer.on({
        click: function(e) {
          search
            .val(e.target.feature.properties.office)
            .trigger('keyup');
        }
    });
    }
  }).addTo(map);

  map.fitBounds(markers.getBounds());
  return map;
}

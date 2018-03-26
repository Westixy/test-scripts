var DirectionModule = (function() {
  // jquery selectors
  var $Map = null,
    $AddressForm = null,
    $AddressField = null,
    $ReverseButton = null,
    $ResetButton = null,
    $TplMarkerWindow = null,
    $RemoveMarkerButton = null,
    $avoidHighways = null

  // google maps configuration
  var maps = {
    zoom: 12,
    lat: 46.53,
    lng: 6.63282,
    streetViewControl: false,
  }

  var steps = [], // steps (clicked by the user)
    markers = [] // google maps markers

  // services
  var DirectionsService = null,
    DirectionsDisplay = null,
    GeocoderService = null,
    directionsServiceResult = null

  // objects
  var Map = null

  var isReady = false

  var autocomplete = null
  /*
     * PRIVATES METHODS
     */

  function init() {
    // jquery selectors
    ;($Map = $('#map')),
      ($AddressForm = $('#address-form')),
      ($AddressField = $('#address-field')),
      ($ReverseButton = $('#reverse-button')),
      ($ResetButton = $('#reset-button')),
      ($TplMarkerWindow = $('#tpl-marker-window'))

    // Check if the checkbox avoidHighways is checked, then return bool
    $('#avoidHighways').change(function() {
      if ($(this).is(':checked')) {
        $avoidHighways = true
      } else {
        $avoidHighways = false
      }
      updateDirection()
    })

    // init the google maps object in the html node
    Map = new google.maps.Map($Map[0], {
      zoom: maps.zoom,
      center: new google.maps.LatLng(maps.lat, maps.lng),
      streetViewControl: maps.streetViewControl,
      preserveViewport: true,
    })

    //Autocomplete (streets + cities)
    var options = {
      types: ['geocode'],
    }
    autocomplete = new google.maps.places.Autocomplete(
      $AddressField[0],
      options
    )

    // To clear the input after submission
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      $AddressField.one('blur', function() {
        $AddressField.val('')
      })
    })

    // geolocalisation if possible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        // save coordonates
        maps.lat = position.coords.latitude
        maps.lng = position.coords.longitude
        // center the map
        Map.setCenter(new google.maps.LatLng(maps.lat, maps.lng))
      })
    }

    // load services
    DirectionsService = new google.maps.DirectionsService()
    GeocoderService = new google.maps.Geocoder()

    // init defaults
    initDefaults()

    // bind events
    bindEvents()

    // init viewport
    initViewport()

    // module is ready
    isReady = true
    $(DirectionModule).triggerHandler('ready')
  }

  function bindEvents() {
    // listen for a click into the map
    google.maps.event.addListener(Map, 'click', function(e) {
      // add the new step
      addStep(e.latLng)

      // update direction
      updateDirection()
    })

    // listen for a new address
    $AddressForm.bind('submit', function() {
      addAddress()
      return false
    })

    // listen for reverse
    $ReverseButton.bind('click', function() {
      reverseDirection()
      return false
    })

    // listen for reset
    $ResetButton.bind('click', function() {
      resetDirection()
      return false
    })
  }

  function initDefaults() {
    var savedSteps = StorageModule.getValue('directionSteps')

    if (savedSteps !== null) {
      for (var i in savedSteps) {
        // save a new google latlng object
        // if lat and lng are numbers
        if (
          typeof savedSteps[i].position.lat === 'number' &&
          typeof savedSteps[i].position.lng === 'number'
        ) {
          addStep(
            new google.maps.LatLng(
              savedSteps[i].position.lat,
              savedSteps[i].position.lng
            )
          )
        }
      }

      // update direction if steps
      updateDirection()
    }
  }

  function initViewport() {
    // delete the directionDisplay object if it exists
    if (DirectionsDisplay !== null) {
      DirectionsDisplay.setMap(null)
    }

    // create a new one
    DirectionsDisplay = new google.maps.DirectionsRenderer({
      map: Map,
      preserveViewport: true,
      suppressMarkers: true,
    })
  }

  function addAddress() {
    // if there is something
    var address = $AddressField.val()
    if (address.length > 0) {
      // get the coordonates
      GeocoderService.geocode({ address: address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          // add the new step
          addStep(results[0].geometry.location)

          // update direction
          updateDirection()

          // empty the address field
          $AddressField.val('')
        } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
          alert(TranslateModule.t('AddressNotFound'))
        } else {
          alert(TranslateModule.t('AddressLookupFailed'))
        }
      })
    }
  }

  function addStep(LatLng) {
    // add the step to the collection
    steps.push({
      position: LatLng,
    })
  }

  function reverseDirection() {
    // reverse steps
    steps.reverse()

    // update direction
    updateDirection()
  }

  function resetDirection() {
    // clear the steps
    steps = []

    // update direction
    updateDirection()
  }

  function updateDirection(fitToBounds) {
    //
    // - IF 0 step
    // remove direction
    // remove markers
    // reset chart
    //
    // - IF 1 step
    // remove direction
    // add markers (need Google direction service request)
    // reset chart
    //
    // - IF more steps
    // add direction
    // add markers (need Google direction service request)
    // add chart
    //

    // reset all
    clearMarkers()
    EngineModule.resetResults()
    ChartModule.resetChart()
    initViewport()

    // one or more steps
    // need request to direction service
    if (steps.length >= 1) {
      var avoidHighways = $avoidHighways

      // find origin and final positions
      // (for Google directionsService)
      var origin = steps[0].position
      var destination = steps[steps.length - 1].position

      // intermediates steps (waypoints)
      // (for Google directionsService)
      var waypoints = []
      for (var i = 1; i < steps.length - 1; i++) {
        waypoints.push({
          location: steps[i].position,
        })
      }

      // prepare the request
      var request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        avoidHighways: avoidHighways,
      }

      //console.log('Google Direction Service request', request);

      // send request to Google directionsService
      DirectionsService.route(request, function(response, status) {
        //console.log('Google Direction Service response', response);

        if (status == google.maps.DirectionsStatus.OK) {
          // save direction service result
          directionsServiceResult = response

          // add markers
          var legs = response.routes[0].legs
          var single = true
          for (var i in legs) {
            createMarker(legs[i].start_location, i)
            // prevent to add 2 markers for one point (then only B will be shown)
            if (legs[i].end_address !== legs[i].start_address) {
              single = false
            }
          }
          if (!single) {
            createMarker(legs[legs.length - 1].end_location, legs.length)
          }

          // more than one step
          // set direction and chart
          // fit viewport to show all markers
          if (steps.length > 1) {
            // set the direction
            DirectionsDisplay.setDirections(response)

            // update chart and request the consumption
            var path = response.routes[0].overview_path
            ChartModule.updateChart(path)

            // If it's asked by the fitToBounds parameter
            // check if all points are on the map
            // if not, auto zoom and fit the map to all the points
            if (typeof fitToBounds !== 'undefined' ? fitToBounds : true) {
              var bounds = new google.maps.LatLngBounds()
              var visibleBounds = Map.getBounds() // get bounds of the map object's viewport
              var mustFit = false
              for (var i in steps) {
                var bound = new google.maps.LatLng(
                  steps[i].position.lat(),
                  steps[i].position.lng()
                )
                bounds.extend(bound)
                if (!visibleBounds.contains(bound)) {
                  mustFit = true
                }
              }
              if (mustFit) {
                Map.fitBounds(bounds)
              }
            }
          }
        } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
          alert(TranslateModule.t('UnableToTraceARoute'))
          // delete the last steps added
          steps.pop()
        } else if (
          status == google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED
        ) {
          alert(TranslateModule.t('NoMore10Steps'))
          // delete the last steps added
          steps.pop()
        } else {
          alert(TranslateModule.t('FailedToGetDirections'))
          // delete the last steps added
          steps.pop()
        }

        // save steps
        saveSteps()
      })
    } else {
      // save steps
      saveSteps()
    }
  }

  var infowindow = new google.maps.InfoWindow({
    size: new google.maps.Size(150, 50),
  })

  function createMarker(LatLng, i) {
    var step = {
      id: i,
      position: LatLng,
    }

    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var letter = alphabet.charAt(step.id)

    // options for the template
    // categories and vehicles list
    var opts = {
      step: step,
    }

    // generate from handlebars template
    var template = Handlebars.compile($TplMarkerWindow.html())
    var windowContent = template(opts)

    var Marker = new google.maps.Marker({
      map: Map,
      position: step.position,
      icon: 'http://maps.google.com/mapfiles/marker' + letter + '.png',
      draggable: true,
      stepId: step.id,
    })
    markers.push(Marker)

    google.maps.event.addListener(Marker, 'click', function() {
      infowindow.setContent(windowContent)
      infowindow.open(Map, Marker)

      // on remove marker
      $('.marker-remove')
        .off('click')
        .on('click', function() {
          removeMarker($(this).attr('data-step'))
        })
    })

    google.maps.event.addListener(Marker, 'dragend', function(event) {
      steps[step.id].position = event.latLng
      updateDirection(false)
    })

    StepsModule.updateStepsModule(markers)
  }

  function removeMarker(i) {
    if (typeof steps[i] !== 'undefined') {
      steps.splice(i, 1)
    }
    updateDirection()

    StepsModule.updateStepsModule(markers)
  }

  function clearMarkers() {
    for (var i in markers) {
      markers[i].setMap(null)
    }
    markers = []
  }

  function saveSteps() {
    // formate waypoints to save coordonate in lat & lng attributes
    // (google use none fixed name for these attributes)
    var sSteps = []
    for (var iStep in steps) {
      sSteps.push({
        position: {
          lat: steps[iStep].position.lat(),
          lng: steps[iStep].position.lng(),
        },
      })
    }
    StorageModule.setValue('directionSteps', sSteps)
  }

  /*
     * PUBLICS METHODS
     */

  return {
    init: function() {
      init()
    },

    getMap: function() {
      if (isReady) {
        return Map
      } else {
        $(VehiclesModule).bind('ready', function() {
          return Map
        })
      }
    },

    removeMarker: function(markerId) {
      removeMarker(markerId)
    },

    getDirectionsServiceResult: function() {
      if (isReady) {
        return directionsServiceResult
      } else {
        $(VehiclesModule).bind('ready', function() {
          return directionsServiceResult
        })
      }
    },
  }
})()

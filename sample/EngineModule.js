var EngineModule = (function() {
  // jquery selectors
  var $SpeedField = null,
    $DrivingField = null,
    $UpdateButton = null,
    $AutomaticSpeed = null,
    $VehiclesResults = null,
    $VehiclesModalItems = null,
    $TplVehiclesResults = null,
    $VehicleModal = null
  $VehicleModalContent = null
  ;($TplVehicleModalContent = null),
    ($VehicleModalSave = null),
    ($VehicleDetailsReset = null),
    ($RemoveVehicleButtons = null)

  var waypoints = {},
    params = {
      vConsigne: 80,
      lSport: 0,
      distanceType: 'man',
    }
  var vehicles = new VehiclesCollection()

  var isReady = false

  /*
     * PRIVATES METHODS
     */

  function init() {
    // jquery selectors
    $SpeedField = $('#speed-field')
    $DrivingField = $('#driving-field')
    $UpdateButton = $('#update-params-button')
    $AutomaticSpeed = $('#speed-auto')
    $VehiclesResults = $('#vehicles-results')
    $TplVehiclesResults = $('#tpl-vehicles-results')
    $VehicleModal = $('#vehicle-modal')
    $VehicleModalContent = $('#vehicle-modal-content')
    $TplVehicleModalContent = $('#tpl-vehicle-modal-content')
    $VehicleModalSave = $('#vehicle-modal-save')
    $VehicleDetailsReset = $('#vehicle-details-reset')
    $DistanceField = $('#distance-field')

    // get saved params from the storage
    setSpeed(StorageModule.getValue('engineSpeed'))
    setDriving(StorageModule.getValue('engineDriving'))
    setSpeedAuto(StorageModule.getValue('speedAuto'))
    // init defaults
    initDefaults()

    // bind events
    bindEvents()

    // module is ready
    isReady = true
    $(EngineModule).triggerHandler('ready')
  }

  function bindEvents() {
    // listen for a changment of speed
    $UpdateButton.bind('click', function() {
      setSpeed($SpeedField.val())
      setDriving($DrivingField.data('rangeinput').getValue())
      return false
    })

    // listen for a click on a details button
    $VehicleModal.on('show.bs.modal', function(e) {
      var $invoker = $(e.relatedTarget)
      var vehicleId = $invoker.attr('data-vehicle')
      showVehicleDetails(vehicles.findById(vehicleId))
    })

    // listen for a click on the save details button
    $VehicleModalSave.on('click', function() {
      saveVehicleDetails()
    })

    $VehicleDetailsReset.on('click', function() {
      resetVehicleDetails()
    })

    // listen for a change of automatic speed checkbox
    $AutomaticSpeed.on('change', function() {
      if ($(this).is(':checked')) {
        setSpeedAuto('auto')
      } else {
        setSpeedAuto('man')
      }
    })
  }

  function initDefaults() {
    var savedVehicles = StorageModule.getValue('vehicles')

    if (savedVehicles !== null) {
      $.each(savedVehicles, function(index, vehicle) {
        vehicle.result = null
        addVehicle(vehicle)
        VehiclesModule.highlightVehicle(vehicle.id)
      })

      // update the list
      // (only if there is vehicles)
      updateSelectedVehicles()
    }
  }

  function setSpeed(speed) {
    // if there is something
    speed = parseInt(speed)
    if (isNaN(speed)) {
      speed = 80
    }

    // set the attribute and make a request to the server
    // if the attribute change
    if (params.vConsigne !== speed) {
      params.vConsigne = speed
      compute()
    }

    $SpeedField.val(params.vConsigne)
    StorageModule.setValue('engineSpeed', params.vConsigne)
  }

  function setDriving(driving) {
    // if there is something
    driving = parseInt(driving)
    if (isNaN(driving) || driving < 0 || driving > 10) {
      driving = 5
    }

    // set the attribute and make a request to the server
    // if the attribute change
    if (params.lSport !== driving) {
      params.lSport = driving
      compute()

      $DrivingField.data('rangeinput').setValue(params.lSport)
      StorageModule.setValue('engineDriving', params.lSport)
    }
  }

  function setWaypoints(w) {
    waypoints = w

    compute()
  }

  function addVehicle(vehicle) {
    // some default options
    if (typeof vehicle.accessoriesPower === 'undefined') {
      vehicle.accessoriesPower = 0
    }
    if (typeof vehicle.passengers === 'undefined') {
      vehicle.passengers = 1
    }

    vehicles.add(vehicle)

    StorageModule.setValue('vehicles', vehicles.all())

    compute()
  }

  function removeVehicle(vehicleId) {
    vehicles.deleteById(vehicleId)

    StorageModule.setValue('vehicles', vehicles.all())
    updateSelectedVehicles()
  }

  function resetResults() {
    // reset each vehicles reset
    $.each(vehicles.all(), function(index, vehicle) {
      vehicle.result = null
    })

    $DistanceField.val(0)

    updateSelectedVehicles()
  }

  function updateSelectedVehicles() {
    var list = []
    vehicles.sort()

    $.each(vehicles.all(), function(index, vehicle) {
      list.push(vehicle)
    })

    // options for the template
    // categories and vehicles list
    var opts = {
      vehicles: list,
    }

    // generate from handlebars template
    // and remove template from the html source
    var template = Handlebars.compile($TplVehiclesResults.html())
    $VehiclesResults.html(template(opts))

    // set event to remove a vehicle from the results
    $RemoveVehicleButtons = $('#vehicles-results .close')
    $RemoveVehicleButtons.off('click').on('click', function() {
      var vehicleId = $(this).attr('data-vehicle')
      removeVehicle(vehicleId)
      VehiclesModule.unHighlightVehicle(vehicleId)
    })
  }

  function compute() {
    // set the selected vehicles in an array
    var rVehicles = []

    if (vehicles.count() >= 1) {
      $.each(vehicles.all(), function(index, vehicle) {
        rVehicles.push(vehicle)
      })
    }

    // min 1 vehicle & 2 waypoints
    if (rVehicles.length >= 1 && waypoints.length >= 2) {
      // formate steps
      var rSteps = []
      var s = DirectionModule.getDirectionsServiceResult()
      for (var iRoute in s.routes) {
        var route = s.routes[iRoute]
        for (var iLeg in route.legs) {
          var leg = route.legs[iLeg]
          for (var iStep in leg.steps) {
            var step = leg.steps[iStep]
            rSteps.push({
              distance: {
                value: step.distance.value,
              },
              duration: {
                value: step.duration.value,
              },
            })
          }
        }
      }

      // formate waypoints
      var rWaypoints = []
      for (var iWaypoint in waypoints) {
        rWaypoints.push({
          elevation: waypoints[iWaypoint].elevation,
          location: {
            lat: waypoints[iWaypoint].location.lat(),
            lng: waypoints[iWaypoint].location.lng(),
          },
        })
      }

      // formate request
      var request = {
        request: {
          vehicles: rVehicles,
          waypoints: rWaypoints,
          params: params,
          steps: rSteps,
        },
      }
      //console.log('Engine request', request);

      var request = JSON.stringify(request)

      $.ajax({
        url: url + 'api/engine',
        type: 'POST',
        data: {
          request: request,
          dataType: 'json',
        },
        success: function(response) {
          response = jQuery.parseJSON(response)
          //console.log('Engine response', response);

          if (typeof response.vehicles === 'undefined') {
            alert(TranslateModule.t('UnableToCalculateEnergy'))
          } else {
            ChartModule.addFilteredWaypoints(response.waypoints)

            // set the result to each vehicles
            for (var i in response.vehicles) {
              var vehicle = response.vehicles[i]
              if (
                typeof vehicles.findByIdves(vehicle.id).result === 'undefined'
              ) {
                vehicles.findById(vehicle.id).result = {}
              }
              vehicles.findByIdves(vehicle.id).result = vehicle
            }

            $DistanceField.val(response.vehicles[0].distot)

            if (params.distanceType == 'auto') {
              $SpeedField.val(response.vehicles[0].vitesse)
            }

            // update the list
            updateSelectedVehicles()
          }
        },
        error: function(error) {
          alert(TranslateModule.t('UnableToCalculateEnergy'))
        },
      })
    } else if (rVehicles.length >= 1) {
      // if min a vehicle
      // update the list
      updateSelectedVehicles()
    }
  }

  function showVehicleDetails(vehicle) {
    // options for the template
    // categories and vehicles list
    var opts = {
      vehicle: vehicle,
    }

    // generate from handlebars template
    var template = Handlebars.compile($TplVehicleModalContent.html())
    $VehicleModalContent.html(template(opts))
  }

  function saveVehicleDetails() {
    var vehicleId = parseInt($('#vehicle-details-id').val())

    if (typeof vehicles.findById(vehicleId) !== 'undefined') {
      var vehicle = vehicles.findById(vehicleId)

      // update vehicle informations
      vehicle.poidsVideKg = $('#vehicle-details-emptyweight').val()
      vehicle.scx = $('#vehicle-details-scx').val()
      vehicle.batterieEnergiekWh = $('#vehicle-details-batteryenergy').val()
      vehicle.rdtMoteur = $('#vehicle-details-chainperformancetraction').val()
      vehicle.cr = $('#vehicle-details-coefficientrollingresistance').val()
      vehicle.vMaxPm0 = $('#vehicle-details-maximumspeed').val()
      vehicle.precup = $('#vehicle-details-recoveredpower').val()
      //vehicle.passengers = $('#vehicle-details-numberpassengers').val();
      vehicle.accessoriesPower = $('#vehicle-details-accessoriespower').val()

      // update list
      compute()
      StorageModule.setValue('vehicles', vehicles.all())
    }

    // hide modal
    $VehicleModal.modal('hide')
  }

  function resetVehicleDetails() {
    var vehicleId = parseInt($('#vehicle-details-id').val())

    // Get the defaults informations from the database
    $.when(VehiclesModule.refreshVehiclesCollection()).done(function() {
      var vehicle = VehiclesModule.getVehiclesCollection().findById(vehicleId)

      // update vehicle informations
      $('#vehicle-details-emptyweight').val(vehicle.poidsVideKg)
      $('#vehicle-details-scx').val(vehicle.scx)
      $('#vehicle-details-batteryenergy').val(vehicle.batterieEnergiekWh)
      $('#vehicle-details-chainperformancetraction').val(vehicle.rdtMoteur)
      $('#vehicle-details-coefficientrollingresistance').val(vehicle.cr)
      $('#vehicle-details-maximumspeed').val(vehicle.vMaxPm0)
      $('#vehicle-details-recoveredpower').val(vehicle.precup)
      //$('#vehicle-details-numberpassengers').val(vehicle.passengers);
      $('#vehicle-details-accessoriespower').val(0)

      compute()
    })
  }

  function setSpeedAuto(val) {
    if (val === 'man') {
      // save params
      params.distanceType = 'man'

      // select checkbox
      // disable speed field
      $AutomaticSpeed.prop('checked', false)
      $SpeedField.prop('disabled', false)
    } else {
      // save params
      params.distanceType = 'auto'

      // select checkbox
      // disable speed field
      $AutomaticSpeed.prop('checked', true)
      $SpeedField.prop('disabled', true)
    }

    // set the attribute and make a request to the server
    // if the attribute change
    compute()
    StorageModule.setValue('speedAuto', params.distanceType)
  }

  /*
     * PUBLICS METHODS
     */

  return {
    init: function() {
      init()
    },

    setWaypoints: function(w) {
      if (isReady) {
        setWaypoints(w)
      } else {
        $(VehiclesModule).bind('ready', function() {
          setWaypoints(w)
        })
      }
    },

    addVehicle: function(vehicle) {
      if (isReady) {
        addVehicle(vehicle)
      } else {
        $(VehiclesModule).bind('ready', function() {
          addVehicle(vehicle)
        })
      }
    },

    removeVehicle: function(vehicleId) {
      if (isReady) {
        removeVehicle(vehicleId)
      } else {
        $(VehiclesModule).bind('ready', function() {
          removeVehicle(vehicleId)
        })
      }
    },

    resetResults: function() {
      if (isReady) {
        resetResults()
      } else {
        $(VehiclesModule).bind('ready', function() {
          resetResults()
        })
      }
    },
  }
})()

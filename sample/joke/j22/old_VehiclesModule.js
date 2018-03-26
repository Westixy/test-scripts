function getVehicles() {
  var dfd = $.Deferred()

  //OLD
  $.when(parseFiles()).done(function() {
    dfd.resolve()
  })

  return dfd.promise()
}

//Deprecated
function parseFiles() {
  var dfd = $.Deferred()

  // list of the files
  var files = [
    {
      id: 1,
      name: 'Cars',
      file: 'cars.xml',
    },
    {
      id: 2,
      name: 'Slowcars',
      file: 'slowcars.xml',
    },
    {
      id: 3,
      name: 'Protos',
      file: 'protos.xml',
    },
  ]

  // parse each files
  // a file => a category
  var count = 0
  for (var c = 0; c < files.length; c++) {
    // closure to keep the name of the category in the asynchronous requests
    ;(function(category) {
      // url to vehicles images
      var imagesUrl = url + 'images/vehicles/'

      // load the file
      $.ajax({
        type: 'post',
        data: 'json',
        url: url + 'data/' + category.file,
        success: function(response) {
          // parse
          $(response)
            .find('car')
            .each(function() {
              var $this = $(this)

              ListVehicles[$this.find('id').text()] = {
                id: $this.find('IDVES').text(),
                idves: $this.find('IDVES').text(),
                description: $this.find('Description').text(),
                poidsVideKg: $this.find('PoidsVideKg').text(),
                puissanceElectriquekW: $this
                  .find('PuissanceElectriquekW')
                  .text(),
                vMaxPm0: $this.find('VMaxPm0').text(),
                sCx: $this.find('SCx').text(),
                cr: $this.find('Cr').text(),
                batterieEnergiekWh: $this.find('BatterieEnergiekWh').text(),
                photo: imagesUrl + $this.find('Photo').text(),
                rdtBattDecharge: $this.find('RdtBattDecharge').text(),
                rdtBattCharge: $this.find('RdtBattCharge').text(),
                rdtMoteur: $this.find('RdtMoteur').text(),
                pRecup: $this.find('Precup').text(),
                vitesseCharge: $this.find('VitesseCharge').text(),
                puissanceHumaineW: $this.find('PuissanceHumaineW').text(),
                rdtPanneau: $this.find('RdtPanneau').text(),
                puissancePanneauW: $this.find('PuissancePanneauW').text(),
                remarque: $this.find('Remarque').text(),
                category: {
                  id: category.id,
                  name: category.name,
                },
              }
            })

          // resolve when last file
          if (++count == files.length) {
            dfd.resolve()
          }
        },
        error: function() {
          dfd.reject()
        },
      })
    })(files[c])
  }

  return dfd.promise()
}

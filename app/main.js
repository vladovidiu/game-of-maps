import './main.scss'
import template from './main.html'

import { ApiService } from './services/api'

import { InfoPanel } from './components/info-panel/info-panel'
import { Map } from './components/map/map'

/** Main UI Controller Class */
class ViewController {
  /** Initialize Application */
  constructor () {
    document.getElementById('app').outerHTML = template

    // Initialize API service
    if (window.location.hostname === 'localhost') {
      this.api = new ApiService('http://localhost:5000/')
    } else {
      this.api = new ApiService('https://api.atlasofthrones.com/')
    }

    this.locationPointTypes = [ 'castle', 'city', 'town', 'ruin', 'region', 'landmark' ]
    this.initializeComponents()
    this.loadMapData()
  }

  /** Initialize Components with data and event listeners */
  initializeComponents () {
    // Initialize Info Panel
    this.infoComponent = new InfoPanel('info-panel-placeholder')
    this.mapComponent = new Map('map-placeholder')
  }

  /** Load map data from the API */
  async loadMapData () {
    const kingdomGeojson = await this.api.getKingdoms()

    this.mapComponent.addKingdomGeojson(kingdomGeojson)
    this.mapComponent.toggleLayer('kingdom')

    for (let locationType of this.locationPointTypes) {
      const geojson = await this.api.getLocations(locationType)
      this.mapComponent.addLocationGeojson(locationType, geojson, this.getIconUrl(locationType))
      this.mapComponent.toggleLayer(locationType)
    }
  }

  getIconUrl (layerName) {
    return `https://cdn.patricktriest.com/atlas-of-thrones/icons/${layerName}.svg`
  }
}

window.ctrl = new ViewController()

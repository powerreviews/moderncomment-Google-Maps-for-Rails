#######################################################################################################
################################################  deCarta  ############################################
#######################################################################################################

class @Gmaps4RailsDecarta extends Gmaps4Rails

  constructor: ->
    super
    
    @map_options = 
      zoom: 14
      minZoom: 18
      maxZoom: 10
      controls:
        CopyrightControl: "bottomRight"
        PanControl: "topLeft"
    @mergeWithDefault "map_options"
    @markers_conf = {}
    @mergeWithDefault "markers_conf"

    @openMarkers = null
    @markersLayer = null
    @markersControl = null
    @polylinesLayer = null

  #////////////////////////////////////////////////////
  #/////////////// Basic Objects   ////////////////////
  #////////////////////////////////////////////////////

  createPoint: @createLatLng

  createLatLng: (lat, lng)->
    return new deCarta.Core.Position(lat, lng)

  createLatLngBounds: ->
     pos = []
     pos.push marker.serviceObject.getPosition() for marker in @markers
     new deCarta.Core.BoundingBox(pos)
  
  createMap: ->
    deCarta.Core.Configuration.clientName = @map_options.provider_user
    deCarta.Core.Configuration.clientPassword = @map_options.provider_key
    
    @loadControl controlName, position for controlName, position of @map_options.controls
    @map_options.controls = []
    
    new deCarta.Core.Map(@map_options)
  
  loadControl: (controlName, position) ->
    if deCarta.UI[controlName]?
      #already loaded, just do it
      @serviceObject.addControl new deCarta.UI[controlName] {position: position}
    else
      # Load the js dynamically
      a = document.createElement 'script'
      a.src = "/assets/UI/#{controlName}.js"
      document.body.appendChild a
      # Don't forget the css
      a = document.createElement 'link'
      a.rel = 'stylesheet'
      a.type = 'text/css'
      a.href = "/assets/deCarta/UI/#{controlName}.css"
      document.head.appendChild a
      _self = this
      setTimeout ->
        _self.loadControl.call _self, controlName, position
      , 100

  #////////////////////////////////////////////////////
  #////////////////////// Markers /////////////////////
  #////////////////////////////////////////////////////
  createMarker: (args) ->
    marker_options = {}
  
    #//creating markers' dedicated layer 
    if (@markersLayer == null) 
      @markersLayer = new deCarta.Core.MapOverlay({name: "Markers"})
      @serviceObject.addLayer(@markersLayer)
    if args.marker_picture != ""  
      marker_options.xOffset    = args.marker_width
      marker_options.yOffset   = args.marker_height
      marker_options.imageSrc = args.marker_picture
    
    marker_options.text = args.description
    marker_options.position = @createLatLng(args.Lat, args.Lng)
    marker = new deCarta.Core.Pin marker_options

    #//adding layer to the map
    @markersLayer.addObject(marker)
  
    return marker

  #//clear markers
  clearMarkers: ->
    @clearMarkersLayerIfExists()
    @markersLayer = null
    @boundsObject = new deCarta.Core.BoundingBox()
  
  clearMarkersLayerIfExists: -> 
    return if @markersLayer == null
    @markersLayer.clear()
    @markersLayer.render @serviceObject.tileGrid
    @serviceObject.removeOverlay @markersLayer
  
  extendBoundsWithMarkers: ->
    @boundsObject = @createLatLngBounds()

  #////////////////////////////////////////////////////
  #/////////////////// Clusterer //////////////////////
  #////////////////////////////////////////////////////

  createClusterer: (markers_array)->
   
  clusterize: ->
   
  clearClusterer: ->

  #////////////////////////////////////////////////////
  #/////////////////// INFO WINDOW ////////////////////
  #////////////////////////////////////////////////////

  #// creates infowindows
  createInfoWindow: (marker_container) ->
    marker_container.serviceObject.setText marker_container.description if marker_container.description?
  
  #////////////////////////////////////////////////////
  #/////////////////// POLYLINES //////////////////////
  #////////////////////////////////////////////////////

  create_polyline : (polyline) ->
    if(@polylinesLayer == null)
      @polylinesLayer = new deCarta.Core.MapOverlay({name: "Polylines"})
      @serviceObject.addLayer(@polylinesLayer)
    
    polyline_coordinates = []
    polyline_options = {}

    for element in polyline
      #by convention, a single polyline could be customized in the first array or it uses default values
      if element == polyline[0]
        polyline_options.strokeColor   = element.strokeColor   || @polylines_conf.strokeColor
        polyline_options.strokeOpacity = element.strokeOpacity || @polylines_conf.strokeOpacity
        polyline_options.strokeSize  = element.strokeWeight  || @polylines_conf.strokeWeight
        #clickable     = element.clickable     || @polylines_conf.clickable
        #zIndex        = element.zIndex        || @polylines_conf.zIndex	  
      
      #add latlng if positions provided
      if element.lat? && element.lng?
        latlng = @createLatLng(element.lat, element.lng)
        polyline_coordinates.push(latlng)
    
    polyline_options.lineGeometry = polyline_coordinates
    
    polyline = new deCarta.Core.Polyline(polyline_options)
    @polylinesLayer.addObject polyline
    @polylinesLayer.render @serviceObject.tileGrid
    return polyline

  updateBoundsWithPolylines: ()->
  
  updateBoundsWithPolygons: ()->
    
  updateBoundsWithCircles: ()->
  
  # #////////////////////////////////////////////////////
  # #/////////////////// Other methods //////////////////
  # #////////////////////////////////////////////////////
 
  fitBounds: ->
    return unless @boundsObject
    z = @boundsObject.getIdealCenterAndZoom @serviceObject
    if z.zoom > 0
      @serviceObject.centerOn z.center
      @serviceObject.zoomTo z.zoom
    else
      @serviceObject.centerOn @boundsObject.getCenter()
  
  centerMapOnUser: ->
    @serviceObject.centerOn @userLocation
    
  extendMapBounds :->
    
  adaptMapToBounds: ->
    @fitBounds()

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Gmaps4RailsDecarta = (function(_super) {

    __extends(Gmaps4RailsDecarta, _super);

    function Gmaps4RailsDecarta() {
      Gmaps4RailsDecarta.__super__.constructor.apply(this, arguments);
      this.map_options = {
        zoom: 14,
        minZoom: 18,
        maxZoom: 10,
        controls: {
          CopyrightControl: "bottomRight",
          PanControl: "topLeft"
        }
      };
      this.mergeWithDefault("map_options");
      this.markers_conf = {};
      this.mergeWithDefault("markers_conf");
      this.openMarkers = null;
      this.markersLayer = null;
      this.markersControl = null;
      this.polylinesLayer = null;
    }

    Gmaps4RailsDecarta.prototype.createPoint = Gmaps4RailsDecarta.createLatLng;

    Gmaps4RailsDecarta.prototype.createLatLng = function(lat, lng) {
      return new deCarta.Core.Position(lat, lng);
    };

    Gmaps4RailsDecarta.prototype.createLatLngBounds = function() {
      var marker, pos, _i, _len, _ref;
      pos = [];
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        pos.push(marker.serviceObject.getPosition());
      }
      return new deCarta.Core.BoundingBox(pos);
    };

    Gmaps4RailsDecarta.prototype.createMap = function() {
      var controlName, position, _ref;
      deCarta.Core.Configuration.clientName = this.map_options.provider_user;
      deCarta.Core.Configuration.clientPassword = this.map_options.provider_key;
      _ref = this.map_options.controls;
      for (controlName in _ref) {
        position = _ref[controlName];
        this.loadControl(controlName, position);
      }
      this.map_options.controls = [];
      return new deCarta.Core.Map(this.map_options);
    };

    Gmaps4RailsDecarta.prototype.loadControl = function(controlName, position) {
      var a, _self;
      if (deCarta.UI[controlName] != null) {
        return this.serviceObject.addControl(new deCarta.UI[controlName]({
          position: position
        }));
      } else {
        a = document.createElement('script');
        a.src = "/assets/UI/" + controlName + ".js";
        document.body.appendChild(a);
        a = document.createElement('link');
        a.rel = 'stylesheet';
        a.type = 'text/css';
        a.href = "/assets/deCarta/UI/" + controlName + ".css";
        document.head.appendChild(a);
        _self = this;
        return setTimeout(function() {
          return _self.loadControl.call(_self, controlName, position);
        }, 100);
      }
    };

    Gmaps4RailsDecarta.prototype.createMarker = function(args) {
      var marker, marker_options;
      marker_options = {};
      if (this.markersLayer === null) {
        this.markersLayer = new deCarta.Core.MapOverlay({
          name: "Markers"
        });
        this.serviceObject.addLayer(this.markersLayer);
      }
      if (args.marker_picture !== "") {
        marker_options.xOffset = args.marker_width;
        marker_options.yOffset = args.marker_height;
        marker_options.imageSrc = args.marker_picture;
      }
      marker_options.text = args.description;
      marker_options.position = this.createLatLng(args.Lat, args.Lng);
      marker = new deCarta.Core.Pin(marker_options);
      this.markersLayer.addObject(marker);
      return marker;
    };

    Gmaps4RailsDecarta.prototype.clearMarkers = function() {
      this.clearMarkersLayerIfExists();
      this.markersLayer = null;
      return this.boundsObject = new deCarta.Core.BoundingBox();
    };

    Gmaps4RailsDecarta.prototype.clearMarkersLayerIfExists = function() {
      if (this.markersLayer === null) {
        return;
      }
      this.markersLayer.clear();
      this.markersLayer.render(this.serviceObject.tileGrid);
      return this.serviceObject.removeOverlay(this.markersLayer);
    };

    Gmaps4RailsDecarta.prototype.extendBoundsWithMarkers = function() {
      return this.boundsObject = this.createLatLngBounds();
    };

    Gmaps4RailsDecarta.prototype.createClusterer = function(markers_array) {};

    Gmaps4RailsDecarta.prototype.clusterize = function() {};

    Gmaps4RailsDecarta.prototype.clearClusterer = function() {};

    Gmaps4RailsDecarta.prototype.createInfoWindow = function(marker_container) {
      if (marker_container.description != null) {
        return marker_container.serviceObject.setText(marker_container.description);
      }
    };

    Gmaps4RailsDecarta.prototype.create_polyline = function(polyline) {
      var element, latlng, polyline_coordinates, polyline_options, _i, _len;
      if (this.polylinesLayer === null) {
        this.polylinesLayer = new deCarta.Core.MapOverlay({
          name: "Polylines"
        });
        this.serviceObject.addLayer(this.polylinesLayer);
      }
      polyline_coordinates = [];
      polyline_options = {};
      for (_i = 0, _len = polyline.length; _i < _len; _i++) {
        element = polyline[_i];
        if (element === polyline[0]) {
          polyline_options.strokeColor = element.strokeColor || this.polylines_conf.strokeColor;
          polyline_options.strokeOpacity = element.strokeOpacity || this.polylines_conf.strokeOpacity;
          polyline_options.strokeSize = element.strokeWeight || this.polylines_conf.strokeWeight;
        }
        if ((element.lat != null) && (element.lng != null)) {
          latlng = this.createLatLng(element.lat, element.lng);
          polyline_coordinates.push(latlng);
        }
      }
      polyline_options.lineGeometry = polyline_coordinates;
      polyline = new deCarta.Core.Polyline(polyline_options);
      this.polylinesLayer.addObject(polyline);
      this.polylinesLayer.render(this.serviceObject.tileGrid);
      return polyline;
    };

    Gmaps4RailsDecarta.prototype.updateBoundsWithPolylines = function() {};

    Gmaps4RailsDecarta.prototype.updateBoundsWithPolygons = function() {};

    Gmaps4RailsDecarta.prototype.updateBoundsWithCircles = function() {};

    Gmaps4RailsDecarta.prototype.fitBounds = function() {
      var z;
      if (!this.boundsObject) {
        return;
      }
      z = this.boundsObject.getIdealCenterAndZoom(this.serviceObject);
      if (z.zoom > 0) {
        this.serviceObject.centerOn(z.center);
        return this.serviceObject.zoomTo(z.zoom);
      } else {
        return this.serviceObject.centerOn(this.boundsObject.getCenter());
      }
    };

    Gmaps4RailsDecarta.prototype.centerMapOnUser = function() {
      return this.serviceObject.centerOn(this.userLocation);
    };

    Gmaps4RailsDecarta.prototype.extendMapBounds = function() {};

    Gmaps4RailsDecarta.prototype.adaptMapToBounds = function() {
      return this.fitBounds();
    };

    return Gmaps4RailsDecarta;

  })(Gmaps4Rails);

}).call(this);

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "esri/SpatialReference",
  "dojo/dom",
  "esri/map",
  "esri/graphic",
  "esri/geometry/Extent",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point",

  "esri/tasks/RouteTask",
  "esri/tasks/RouteParameters",

  "esri/tasks/FeatureSet",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",

  "esri/tasks/DataFile",
  "esri/dijit/HomeButton",
  "esri/symbols/SimpleFillSymbol",
  "dojo/_base/Color",
  "esri/geometry/Circle",
  "esri/tasks/query",
  "CCIAPI",
  "dojo/domReady!",
], function (
  declare,
  lang,
  SpatialReference,
  dom,
  Map,
  Graphic,
  Extent,
  FeatureLayer,
  Point,
  RouteTask,
  RouteParameters,
  FeatureSet,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  DataFile,
  HomeButton,
  SimpleFillSymbol,
  Color,
  Circle,
  Query,
  CCIAPI
) {
  var instance = null;
  var mapInstance = null;
  var hospitalsFeatureLayer = null;

  var clazz = declare([], {
    // constructor
    constructor: function () {
      console.log(window);
      var CCIItegrationAPIInstance = CCIAPI;
      // var CCIItegrationAPIInstance = addCall();
      console.log(CCIItegrationAPIInstance.addCall());

      this.mapInstance = new Map("map", {
        basemap: "streets",
        center: [-118.243683, 34.052235],
        zoom: 11,
      });

      var unitsFeatureLayer = new FeatureLayer(
        "http://services5.arcgis.com/2j6RLW7Jge6dxQ4l/ArcGIS/rest/services/mgds_training_units/FeatureServer/0"
      );

      this.hospitalsFeatureLayer = new FeatureLayer(
        "http://services5.arcgis.com/2j6RLW7Jge6dxQ4l/ArcGIS/rest/services/mgds_training_hospitals/FeatureServer/0"
      );

      unitsFeatureLayer.fullExtent;
      var home = new HomeButton(
        {
          map: this.mapInstance,
        },
        "HomeButton"
      );
      home.startup();
      this.mapInstance.addLayer(unitsFeatureLayer);
      this.mapInstance.addLayer(this.hospitalsFeatureLayer);
    },
    zoom: function (unit) {
      var point = new Point(unit.Longitude, unit.Latitude);
      this.mapInstance.centerAndZoom(point, 14);
    },
    clear: function () {
      console.log("inLog");
      this.mapInstance.graphics.clear();
    },
    route: function (unit, hosp, barriers) {
      var circleSymb = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_NULL,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
          new Color([105, 105, 105]),
          2
        ),
        new Color([255, 255, 0, 0.25])
      );
      var circle;
      circle = new Circle({
        center: new Point(
          unit.x,
          unit.y,
          new SpatialReference({ wkid: 102100 })
        ),
        geodesic: true,
        radius: "1000",
        radiusUnit: "esriSRUnit_Meter",
      });
      this.mapInstance.graphics.clear();
      this.mapInstance.infoWindow.hide();

      var graphic = new Graphic(circle, circleSymb);
      console.log(graphic, circle, circleSymb);
      this.mapInstance.graphics.add(graphic);

      var query = new Query();
      query.geometry = circle;
      hospitalsFeatureLayer.selectFeatures(
        query,
        FeatureLayer.SELECTION_NEW,
        function (results) {
          console.log(results);
        }
      );

      var pointFrom = new Point(
        unit.geometry.x,
        unit.geometry.y,
        new SpatialReference({ wkid: 102100 })
      );

      var pointTo = new Point(
        hosp.geometry.x,
        hosp.geometry.y,
        new SpatialReference({ wkid: 102100 })
      );

      //->Routing Task
      var routeTask = new RouteTask(
        "http://204.11.33.8:6080/arcgis/rest/services/GSS/Routing_ServiceArea/NAServer/Route"
      );

      var self = this;

      //setup the route parameters
      routeParams = new RouteParameters();
      routeParams.stops = new FeatureSet();
      routeParams.outSpatialReference = {
        wkid: 102100,
      };
      routeParams.barriers = new FeatureSet();

      barrierSymbol = new SimpleMarkerSymbol()
        .setStyle(SimpleMarkerSymbol.STYLE_X)
        .setSize(10);
      barrierSymbol.outline.setWidth(3).setColor(new Color([255, 0, 0]));

      barriers.forEach((barrier) => {
        addBarrier(
          new Point(
            barrier.x,
            barrier.y,
            new SpatialReference({ wkid: 102100 })
          )
        );
      });

      function addBarrier(point) {
        routeParams.barriers.features.push(
          self.mapInstance.graphics.add(new Graphic(point, barrierSymbol))
        );
      }

      console.log(self.mapInstance, routeParams.barriers);

      //define the symbology used to display the route
      stopSymbol = new SimpleMarkerSymbol()
        .setStyle(SimpleMarkerSymbol.STYLE_CROSS)
        .setSize(3);
      stopSymbol.outline.setWidth(4);
      routeSymbol = new SimpleLineSymbol()
        .setColor(new dojo.Color([0, 0, 255, 0.5]))
        .setWidth(5);

      routeTask.on("solve-complete", showRoute);
      routeTask.on("error", errorHandler);

      //Adds a graphic when the user clicks the this.mapInstance. If 2 or more points exist, route is solved.

      function addStop(mapPoint) {
        var stop = self.mapInstance.graphics.add(
          new Graphic(mapPoint, stopSymbol)
        );
        routeParams.stops.features.push(stop);
      }

      //Adds the solved route to the map as a graphic
      function showRoute(evt) {
        self.mapInstance.graphics.add(
          evt.result.routeResults[0].route.setSymbol(routeSymbol)
        );

        var extentToRoute = new Extent(
          unit.geometry.x,
          unit.geometry.y,
          hosp.geometry.x,
          hosp.geometry.y,
          new SpatialReference({ wkid: 102100 })
        );

        console.log(self.mapInstance.graphics);

        self.mapInstance.setExtent(extentToRoute, true);
      }

      //Displays any error returned by the Route Task
      function errorHandler(err) {
        console.log(err);
        alert("An error occured\n" + err.message + "\n");
      }

      //-> add Stops
      addStop(pointFrom);
      addStop(pointTo);

      console.log(routeParams);
      routeTask.solve(routeParams);

      //->End
    },
  });

  clazz.getInstance = function () {
    if (instance === null) {
      instance = new clazz();
    }
    return instance;
  };
  return clazz;
});

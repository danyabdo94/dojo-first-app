define([
  "dojo/_base/declare",
  "dojo/dom",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "dojo/Deferred",
  "dojo/domReady!",
], function (declare, dom, Query, QueryTask, Deferred) {
  var instance = null;

  var clazz = declare([], {
    // constructor
    constructor: function () {
      console.log(this);
    },
    _getQuery: function () {
      var deferred = new Deferred();
      queryTask = new QueryTask(
        "http://services5.arcgis.com/2j6RLW7Jge6dxQ4l/ArcGIS/rest/services/mgds_training_units/FeatureServer/0"
      );

      //initialize query
      query = new Query();

      query.returnGeometry = true;
      query.outFields = ["*"];
      query.orderByFields = ["F__OBJECTID"];
      query.where = "1=1";

      queryTask.execute(
        query,
        function (featuresList) {
          var customFeatures = [];
          if (featuresList.features.length) {
            featuresList.features.forEach((element) => {
              customFeatures.push({
                F__OBJECTID: element.attributes.F__OBJECTID,
                Latitude: element.attributes.Latitude,
                Longitude: element.attributes.Longitude,
                Name: element.attributes.Name,
                Type: element.attributes.Type,
                geometry: element.geometry,
              });
            });
          }
          deferred.resolve(customFeatures);
        },
        function (error) {
          deferred.reject();
          console.log(error);
        }
      );
      return deferred.promise;
    },
    _getNearestHospital: function () {
      var deferred = new Deferred();

      queryTask = new QueryTask(
        "http://services5.arcgis.com/2j6RLW7Jge6dxQ4l/ArcGIS/rest/services/mgds_training_hospitals/FeatureServer/0"
      );

      //initialize query
      query = new Query();

      query.returnGeometry = true;
      query.outFields = ["*"];
      query.orderByFields = ["F__OBJECTID"];
      query.where = "1=1";
      query.distance = "1000";
      query.units = "esriSRUnit_Meter";
      var customFeatures = [];

      queryTask.execute(
        query,
        function (featuresList) {
          if (featuresList.features.length) {
            featuresList.features.forEach((element) => {
              customFeatures.push({
                F__OBJECTID: element.attributes.F__OBJECTID,
                Latitude: element.attributes.Latitude,
                Longitude: element.attributes.Longitude,
                Name: element.attributes.Name,
                Type: element.attributes.Type,
                geometry: element.geometry,
              });
            });
          }
          console.log(customFeatures);
          deferred.resolve(customFeatures[0]);
        },
        function (error) {
          console.log(error);
          deferred.reject();

        }
      );
      return deferred.promise;
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

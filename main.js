//  main script to load all
require([
  "modules/mapModule",
  "modules/gridModule",
  "dojo/on",
  "configs/config",
  "modules/helperModule",
  "modules/serviceModule",
  "dojo/dom",
  "dojo/domReady!",
], function (
  mapModule,
  gridModule,
  on,
  config,
  helperModule,
  restfulServiceHandler,
  dom
) {
  //Map
  var map = mapModule.getInstance();

  //Grid
  var gridModuleControl = new gridModule(config);

  //Helper to pass Query
  var helper = helperModule.getInstance();
  helper._getQuery().then(function (featuresList) {
    gridModuleControl.showOnScreen(featuresList);
  });

  gridModuleControl.on("zoom", function (unit) {
    map.zoom(unit);
  });

  var restfulHandler = restfulServiceHandler.getInstance();

  gridModuleControl.on("route", function (unit) {
    helper._getNearestHospital().then(function (pointToNav) {
      restfulHandler.getData(
        function (barriers) {
          map.route(unit, pointToNav, barriers);
        },
        function (error) {
          console.log("error");
        }
      );
    });
  });

  on(dom.byId("clearButton"), "click", function (event) {
    map.clear();
  });
});

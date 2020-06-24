define(["dojo/_base/declare", "dojo/request", "dojo/domReady!"], function (
  declare,
  request
) {
  var instance = null,
    clazz = declare([], {
      //LOAD data from REST
      getData: function (onSuccess, onFailure) {
        request
          .get("http://192.168.9.142/FE_Service/api/barrier", {
            preventCache: true,
            headers: { "X-Requested-With": null },
            handleAs: "json",
          })
          .then(
            function (response) {
              if (onSuccess && typeof onSuccess == "function") {
                onSuccess(response);
              }
            },
            function (error) {
              if (onFailure && typeof onFailure == "function") {
                onFailure(error);
              }
            }
          );
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

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    alert("AMD");
    // AMD. Register as an anonymous module.
    define("CCIAPI", [], factory);
  } else if (typeof exports === "object") {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    console.log("isNODE");
    module.exports = factory(require("b"));
  } else {
    console.log("UMD");
    // Browser globals (root is window)
    root.CCIAPI = factory(root.b);
  }
})(this, function () {
  function addCall() {
    return "addCall";
  }
  // use b in some fashion.
  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return { addCall };
});

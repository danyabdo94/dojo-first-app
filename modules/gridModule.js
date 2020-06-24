//////////////////////////////////////////////////////////////////////////
/// loading users module defined
//////////////////////////////////////////////////////////////////////////
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/topic",
  "dojo/Deferred",
  "dojo/on",
  "dojo/Evented",
], function (declare, lang, dom, topic, Deferred,  on,Evented) {
  return declare([Evented], {
    loaded: false,

    constructor: function (config) {
      this.config = config;
      this.dataContainer = $("<div></div>");
      this.dataContainer.appendTo($("#grid"));
    },

    showOnScreen: function (dataFromQuery) {
      this._buildUI(dataFromQuery);
    },
    zoomClicked: function (row) {
      this.emit("zoom",row);
    },
    routeClicked: function (row) {
      this.emit("route",row);
    },
    _buildUI: function (dataFromQuery) {
      var self = this;
      this.dataGrid = this.dataContainer
        .kendoGrid({
          datasource: { data: [] },
          scrollable: true, //enable scrolling
          sortable: true, //enable sorting [per column]
          groupable: false, //enable grouping
          resizable: true, //enable column width resizing
          reorderable: true, //enable moving columns to change order
          columnMenu: true, //show menu to hide/show layout columns
          columns: [
            { field: "Name", title: "Name" },
            { field: "Type", title: "Type" },
            { field: "Longitude", title: "Longitude" },
            { field: "Latitude", title: "Latitude" },
            {
              command: [
                {
                  name: "Zoom",
                  iconClass: "k-icon zoom-icon",
                  click: function (e) {
                    // prevent page scroll position change
                    e.preventDefault();
                    // e.target is the DOM element representing the button
                    var tr = $(e.target).closest("tr"); // get the current table row (tr)
                    // get the data bound to the current table row
                    var data = this.dataItem(tr);
                    self.zoomClicked(data);
                  },
                },
              ],
            },
            {
              command: [
                {
                  name: "Route",
                  iconClass: "k-icon route-icon",
                  click: function (e) {
                    // prevent page scroll position change
                    e.preventDefault();
                    // e.target is the DOM element representing the button
                    var tr = $(e.target).closest("tr"); // get the current table row (tr)
                    // get the data bound to the current table row
                    var data = this.dataItem(tr);
                    self.routeClicked(data);
                  },
                },
              ],
            },
          ],
        })
        .data("kendoGrid");
      this.dataGrid.dataSource.data(dataFromQuery);
    },
  });
});

module.exports = function(RED) {

  var elasticsearch = require('elasticsearch');

  function Update(config) {
    RED.nodes.createNode(this,config);
    this.server = RED.nodes.getNode(config.server);
    var node = this;
    this.on('input', function(msg) {

      var client = new elasticsearch.Client({
          hosts: node.server.host.split(' '),
          timeout: node.server.timeout,
          requestTimeout: node.server.reqtimeout
      });
      var documentId = config.documentId;
      var documentIndex = config.documentIndex;
      var documentType = config.documentType;

      // check for overriding message properties
      if (msg.hasOwnProperty("documentId")) {
        documentId = msg.documentId;
      }
      if (msg.hasOwnProperty("documentIndex")) {
        documentIndex = msg.documentIndex;
      }
      if (msg.hasOwnProperty("documentType")) {
        documentType = msg.documentType;
      }

      var params = {
        index: documentIndex,
        type: documentType,
        id: documentId,
        body: {
          doc: msg.payload
        }
      };

      client.update(params).then(function (resp) {
        msg.payload = resp;
        node.send(msg);
      }, function (err) {
        node.error(err);
      });

    });
  }
  RED.nodes.registerType("es-update",Update);
};

module.exports = function (RED) {

    var elasticsearch = require('elasticsearch');

    function Aggregations(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        var node = this;
        this.on('input', function (msg) {

            var client = new elasticsearch.Client({
                hosts: node.server.host.split(' '),
                timeout: node.server.timeout,
                requestTimeout: node.server.reqtimeout
            });
            var documentIndex = config.documentIndex;
            var documentType = config.documentType;
            var query = config.query;
            var aggregations = config.aggregations;

            // check for overriding message properties
            if (msg.hasOwnProperty("documentIndex")) {
                documentIndex = msg.documentIndex;
            }
            if (msg.hasOwnProperty("documentType")) {
                documentType = msg.documentType;
            }
            if (msg.hasOwnProperty("query")) {
                query = msg.query;
            }
            if (msg.hasOwnProperty("aggregations")) {
                aggregations = msg.aggregations;
            }

            // construct the search params
            var params = {
                size: 0
            };
            if (documentIndex !== '')
                params.index = documentIndex;
            if (documentType !== '')
                params.type = documentType;

            if (msg.hasOwnProperty("body")) {
                params.body = msg.body;
            } else {
                params.body = {}
		if (query !== '') {
		    params.body.query = {
                        query_string: {
                            query: query
                        }
                    }
		}
		params.body.aggs = aggregations
            }
	    console.log("elasticsearch aggregation params", JSON.stringify(params,null,'  '))
            client.search(params).then(function (resp) {
                msg.payload = resp;
                node.send(msg);
            }, function (err) {
                node.error(err);
            });

        });
    }
    RED.nodes.registerType("es-aggregations", Aggregations);
};

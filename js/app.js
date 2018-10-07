var SAAgent,
    SASocket,
    connectionListener,
    responseTxt = document.getElementById("responseTxt");

/* Make Provider application running in background */
tizen.application.getCurrentApplication().hide();
var BATCH_SIZE = 100;
var batch = []
function dataGathering() {
	
	window.addEventListener("devicemotion", function(e) {
		
		var dataToSend = {};
	     dataToSend.ax = Math.round(e.acceleration.x * 100);
	     dataToSend.ay = Math.round(e.acceleration.y * 100);
	     dataToSend.az = Math.round(e.acceleration.z * 100);
	     dataToSend.x = Math.round(e.rotationRate.alpha);
	     dataToSend.y = Math.round(e.rotationRate.beta);
	     dataToSend.z = Math.round(e.rotationRate.gamma);
	     dataToSend.time = e.timeStamp;
	     batch.push(dataToSend);
	     if(batch.length == BATCH_SIZE) {
		     var output = JSON.stringify(batch);
		     batch = [];
	    	 SASocket.sendData(SAAgent.channelIds[0], output);
	     }
	     
		});
	}

connectionListener = {
    /* Remote peer agent (Consumer) requests a service (Provider) connection */
    onrequest: function (peerAgent) {

    	console.log("Peer request -> " + peerAgent.appName);
        /* Check connecting peer by appName*/
        if (peerAgent.appName === "HelloAccessoryConsumer") {
            SAAgent.acceptServiceConnectionRequest(peerAgent);

        } else {
            SAAgent.rejectServiceConnectionRequest(peerAgent);

        }
    },

    /* Connection between Provider and Consumer is established */
    onconnect: function (socket) {
        var onConnectionLost,
            dataOnReceive;

        /* Obtaining socket */
        SASocket = socket;

        onConnectionLost = function onConnectionLost (reason) {
        	console.log("Reason - > " + reason);
        };

        /* Inform when connection would get lost */
        SASocket.setSocketStatusListener(onConnectionLost);

        dataOnReceive =  function dataOnReceive (channelId, data) {
            var newData;

            if (!SAAgent.channelIds[0]) {
               	console.log("Something wrong - > ");
                return;
            }
            
            dataGathering();
            	            
        };

        /* Set listener for incoming data from Consumer */
        SASocket.setDataReceiveListener(dataOnReceive);
    },
    onerror: function (errorCode) {
    	
       	console.log("Service connection error " + errorCode);
    }
};

function requestOnSuccess (agents) {
    var i = 0;

    for (i; i < agents.length; i += 1) {
        if (agents[i].role === "PROVIDER") {
 
         	console.log("Service Provider found! " + agents[i].name);
         
            SAAgent = agents[i];
            break;
        }
    }

    /* Set listener for upcoming connection from Consumer */
    SAAgent.setServiceConnectionListener(connectionListener);
};

function requestOnError (e) {
	
 	console.log("requestSAAgent Error" +
            "Error name : " + e.name + "<br />" +
            "Error message : " + e.message);
};
/* Requests the SAAgent specified in the Accessory Service Profile */
webapis.sa.requestSAAgent(requestOnSuccess, requestOnError);

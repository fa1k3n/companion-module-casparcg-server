const dgram = require('dgram'); 

var currentState = {}

function compareBundles(bundleA, bundleB) {
    const keys1 = Object.keys(bundleA), keys2 = Object.keys(bundleB);
    let match = true;
    if(keys1.length !== keys2.length) return false;
    for(const key of keys1) { 
        if(bundleA[key].toString() != bundleB[key].toString()) {
            match = false; 
            break; 
        }
    }
    return match;
}

function decodeTimetag(data) {
    const seconds = (data >> BigInt(4)) & BigInt(0xFFFF)
    const fractions = data & BigInt(0xFFFF)    
    return [seconds, fractions];
}



function decodeValue(valueData) {
    // Read typetag
    let typeTags = []
    let index = 0

    valueData = valueData.subarray(1); // Drop leading ,
    var valueDataString = valueData.toString();
    while(true) {
        const value = valueDataString[index ++];
        if(value == '\0') {
            if(typeTags.length % 2 == 1) {
                if(valueDataString[index ++] != '\0') {
                    console.log("None null extra character read")
                }
            }
            break;
        }
        typeTags.push(value);
    }

    values = []
    for(var i in typeTags) {
        switch(typeTags[i]) {
            case 'F': { values.push(false); break; }
            case 'T': { values.push(true); break; }
            case 's': {
                values.push(valueDataString.substring(index).replace(/\0.*$/, ""))
                break;
            }
            case 'i': {
                var intData = valueData.readUInt32BE(index);
                index += 2; // 32 bit
                values.push(intData);
            }
        }
    }
    return values;
}



function decodePacket(packetData) {
    // REMOVE THIS, FIGURE OUT WHY IT IS NEEDED
    if(packetData.toString() == "")
        return []

    var valueStartIndex = packetData.toString().indexOf(",");
    const address = packetData.subarray(0, valueStartIndex).toString().replace(/\0.*$/, "")
    const value = decodeValue(packetData.subarray(valueStartIndex))
    return [address, value];
}

function decodeBundle(bundleData) {
    // Verify it is a bundle
    if(bundleData.toString('utf8', 0, 8) != '#bundle\0') {
        console.log("Malformed bundle packet");
        return
    }

    const seconds = bundleData.readUInt32BE(8);
    const fractions = bundleData.readUInt32BE(12);
    let size = bundleData.readUInt32BE(16);
    let decodedBundleData = {}
    let offset = 20;
    // Read data
    while(offset <= bundleData.length) {
        const data = bundleData.subarray(offset, offset + size);
        const packet = decodePacket(data);

        if(packet[0] == undefined)
            break;

        decodedBundleData[packet[0]] = packet[1];
        offset += size
        if(offset >= bundleData.length) {
            // No more data in this bundle 
            continue
        }
        size = bundleData.readUInt32BE(offset);
        offset += 4;
    }
    return decodedBundleData;
}

function init(port) {
    const server = dgram.createSocket('udp4');
    server.on('message', (msg, rinfo) => {
        if(String.fromCharCode(msg.readUInt8()) == "#") {
            var currentBundle = decodeBundle(msg);
            if(!compareBundles(currentState, currentBundle)) {
                currentState = currentBundle
                // Hashify the state 
                let stateMap = {}
                for(address in currentState) {
                    let containers = address.split('/');
                    containers.shift();  // Remove first item as this is empty
                    containers.reduce((map, obj, index) => {
                        if(index === containers.length - 1) {
                            // Last item
                            map[obj] = currentState[address]

                        }
                        else if(!(obj in map)) {
                            map[obj] = {};
                        }
                        return map[obj];

                    }, stateMap);
                }

                if('state-updated' in subscribers) {
                    subscribers['state-updated'](stateMap)
                }
            }
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`Server listening at ${address.address}:${address.port}`);
    });

    server.on('error', (err) => {
        console.error(`Server error:\n${err.stack}`);
        server.close();
    });

    server.bind(port);
    return this;
}

let subscribers = {}

this.subscribe = function(address, cbk) {
    subscribers[address] = cbk;
}

exports.listen = init
exports.on = this.subscribe
const redis = require("redis");
const { promisify } = require("util");

//create a REDIS CLIENT
// AKA an object that's going to talk to redis for us

const client = redis.createClient({
    host: "localhost",
    port: 6379,
});
//this error might happen if you forget to run the redis server
// you can run the redis server using the following command:
// redis-server --daemonize yes
client.on("error", function (err) {
    console.log("redis client err: ", err);
});

module.exports.set = promisify(client.set).bind(client);
module.exports.setex = promisify(client.setex).bind(client);
module.exports.get = promisify(client.get).bind(client);
module.exports.del = promisify(client.del).bind(client);

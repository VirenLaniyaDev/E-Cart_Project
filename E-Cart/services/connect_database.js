const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const database = require('../configurations/databaseConfig.json').database;   // Importing database configurations

let db; // It stores database connection, so we don't have to make connection again and again. 

const mongoConnect = (callback) => {
    // Connecting with database
    MongoClient.connect(database.connection_string)
        .then(client => {
            db = client.db(database.name);
            console.log(`Successfully connected with ${database.name} database (MongoDB)!`);
            callback();
        })
        .catch(err => {
            throw err;
        })
}

// getting stored database connection if it is set
const getDB = () => {
    if (db)
        return db;
    return "Error : Database not found!"
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;
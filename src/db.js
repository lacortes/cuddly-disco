const appConfig = require('./config/app');
const { MongoClient } = require('mongodb');
const log = require('./utils/logger');

const uri = appConfig.db_uri;

class MongoDB {
    constructor() {
        this.dbConn = new MongoClient(uri);
    }

    async insertOne(database="", collection="", doc={}) {
        return await this.connect(database, collection, async c => {
            return await c.insertOne(doc);
        });
    }

    async findOne(database="", collection="", query={}, options={}) {
        return await this.connect(database, collection, async c => {
            return await c.findOne(query, options);
        });
    }

    async connect(database, collection, act) {

        if (!database || !collection) {
            log.warn("Missing db or collection");
            return null;
        }

        let result;
        try {
            await this.dbConn.connect();

            // Database
            const db = this.dbConn.db(database);

            // Collection
            const col = db.collection(collection);

            // perform operation
            result = await act(col);

        } catch(err) {  
            log.error(err);
        } finally {
            await this.dbConn.close();
        }
        return result;
    }

    async init() {
        try {
            await this.dbConn.connect();
            await this.dbConn.db("admin").command({ ping: 1 });

            log.info("Connected successfully to database!");
        } finally {
            await this.dbConn.close();
        }
    }
}

module.exports = new MongoDB();
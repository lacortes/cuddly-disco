const { DB_URI } = require('./config/app');
const { MongoClient } = require('mongodb');
const log = require('./utils/logger');

class MongoDB {
    constructor() {
        this.dbConn = new MongoClient(DB_URI);
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

    async findOneAndDelete(database="", collection="", filter={}) {
        return await this.connect(database, collection, async c => {
            return await c.findOneAndDelete(filter);
        });
    }

    async removeOne(database="", collection="", query={}) {
        return await this.connect(database, collection, async c => {
            return await c.deleteOne(query);
        });
    }

    async replaceOne(database="", collection="", filter={}, replacement, options={}) {
        return await this.connect(database, collection, async c => {
            return await c.replaceOne(filter, replacement, options);
        });
    }

    async deleteOne(database="", collection="", filter={}) {
        return await this.connect(database, collection, async c => {
            return await c.deleteOne(filter);
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
            log.info("Initializing MongoDB ...");
            await this.dbConn.connect();
            await this.dbConn.db("admin").command({ ping: 1 });

            log.info("Connected successfully to database!");
        } finally {
            await this.dbConn.close();
        }
    }
}

module.exports = new MongoDB();
const Promisify = require('../utils/Promisify')

module.exports = class User {

    static async setWebSocketId(Id, websocketid) {
        Promisify({
            sql: `update user set websocketId=? where Id=?;`,
            values: [websocketid, Id]
        })
    }

}
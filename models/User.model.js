const Promisify = require('../utils/Promisify')
const QueryBuilder = require('../utils/QueryBuilder')
const defaultCoverPhoto = "https://www.al.com/resizer/ILBcdq1ksZC39_8hhnJ_HXsP9j0=/800x0/smart/cloudfront-us-east-1.images.arcpublishing.com/advancelocal/NSDL77J3KJFZXCK3MFWAV7HMUE.JPG"

module.exports = class User {
    static async searchUsersByInterest({ query, userId }) {
        return Promisify({
            sql: `select Id, name, email, profileImage,
            (select friendship_type from friendship
                where friend1 = ? and friend2 = Id
                ) as friendshipType
                from user where Id in (select userId from 
                    user_interests where interestName like ?);`,
            values: [userId, `%${query}%`]
        })
    }
    static async filterUsers({ query, currentUserId, pageNumber }) {
        return Promisify({
            sql: `select name,profileImage, email, Id, 
                (select friendship_type from friendship
                where friend1 = ? and friend2 = Id
                ) as friendshipType
                from user where name like 
                ? or email like ? and Id!=? limit ?,10;`,
            values: [currentUserId, `%${query}%`, `%${query}%`, currentUserId, pageNumber]
        })
    }
    static async findById(Id) {
        let [user] = await Promisify({
            sql: `select Id, name, email, profileImage, coverPhoto, numFriends, websocketId, serviceworker_id
             from user where Id=?;`,
            values: [Id]
        })
        return user
    }
    static async register(userInfo) {
        try {
            await Promisify({
                sql: QueryBuilder.insertQuery('user', ['password', 'name', 'email', 'coverPhoto']),
                values: [userInfo.password, userInfo.name, userInfo.email, defaultCoverPhoto]
            })
        }
        catch (err) {
            return null
        }
        let newUserRow = await Promisify({
            sql: `SELECT * FROM  user where user.email= ? ;`,
            values: [userInfo.email]
        })
        return newUserRow[0]
    }
    static async setProfileImage(Id, profileImage) {
        return await Promisify({
            sql: `update user set profileImage=? where Id=?`,
            values: [profileImage, Id]
        })
    }
    static async setWebSocketId(Id, websocketid) {
        Promisify({
            sql: `update user set websocketId=? where Id=?;`,
            values: [websocketid, Id]
        })
    }
    static async login(email, password) {

        let user = await Promisify({
            sql: `select * from user where email=? and password=?;`,
            values: [email, password]
        })
        if (user.length == 0) {
            return -1
        }

        else return user[0]
    }
    static async getAll() {
        return Promisify({
            sql: `select * from user`
        })
    }
}
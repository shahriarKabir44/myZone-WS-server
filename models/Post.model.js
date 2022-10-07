const promisify = require('../utils/Promisify')
const QueryBuilder = require('../utils/QueryBuilder')

module.exports = class Post {
    static async createPost(postedBy, postBody) {
        let currentTime = (new Date) * 1
        let currentDay = Math.floor((currentTime) / (24 * 3600 * 1000))
        await promisify({

            sql: QueryBuilder.insertQuery('post', ['body', 'posted_by', 'posted_day', 'posted_on', 'numReactions', 'numComments']),
            values: [postBody, postedBy, currentDay, currentTime, 0, 0]
        })
        let newPost = await promisify({
            sql: QueryBuilder.getLastInsertedRow('post')
        })

        return newPost
    }
    static async setPostImage(postId, postImageURLs) {
        return await promisify({
            sql: `update post set attached_media=? where id=?`,
            values: [(postImageURLs), postId]
        })
    }

}
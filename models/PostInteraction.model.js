const Promisify = require('../utils/Promisify')
const QueryBuilder = require('../utils/QueryBuilder')

module.exports = class PostInteraction {
    static async createComment({ commentBody, commentedBy, postId }) {
        const time = (new Date()) * 1
        await Promisify({
            sql: QueryBuilder.insertQuery('post_comments', ['commentBody', 'commentedBy', 'postId', 'time']),
            values: [commentBody, commentedBy, postId, time]
        })
        Promisify({
            sql: `update post 
            set numComments=numComments+1
            where post.Id=?;`,
            values: [postId]
        })
        let [newComment] = await Promisify({
            sql: `select post_comments.commentBody, post_comments.time, user.name as commenterName, user.Id as commenterId,user.profileImage as commenterProfileImage,post_comments.Id as commentId
            from post_comments,user 
            where post_comments.commentedBy=user.Id and post_comments.postId=? and post_comments.commentedBy=? and time=?;`,
            values: [postId, commentedBy, time]
        })
        return newComment
    }
    static async reactToPost({ postId, reactedBy }) {
        const time = (new Date()) * 1

        Promisify({
            sql: `update post 
            set numReactions=numReactions+1
            where post.Id=?;`,
            values: [postId]
        })
        return Promisify({
            sql: QueryBuilder.insertQuery('post_reactions', ['postId', 'reactedBy', 'time']),
            values: [postId, reactedBy, time]
        })
    }
    static async removeReaction({ postId, reactedBy }) {
        return Promise.all([
            Promisify({
                sql: `update post 
                set numReactions=numReactions-1
                where post.Id=?;`,
                values: [postId]
            }),
            Promisify({
                sql: `delete from post_reactions
                where postId=? and reactedBy=?`,
                values: [postId, reactedBy]
            })
        ])
    }
    static async hasReacted({ postId, reactedBy }) {
        let reaction = await Promisify({
            sql: `select * from post_reactions
            where postId=? and reactedBy=?`,
            values: [postId, reactedBy]
        })
        return reaction.length > 0
    }
}
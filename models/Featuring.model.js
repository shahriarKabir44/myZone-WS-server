const Promisify = require('../utils/Promisify')

module.exports = class FeaturingModel {
    static async getFeaturedAlbums({ createdBy, selectedImgURL }) {
        return await Promisify({
            sql: `SELECT * FROM myzone.featured_post_group
                    as grp
                    where createdBy = ? and ? not in (select photoURL from 
                    featured_post where groupId = grp.Id);`,
            values: [createdBy, selectedImgURL]
        })
    }
    static async createFeaturedAlbum({ label, createdBy }) {
        try {
            await Promisify({
                sql: `INSERT INTO myzone.featured_post_group (label, createdBy) VALUES (?,?);`,
                values: [label, createdBy]
            })
        } catch (error) {
            return null
        }

        let [newAlbum] = await Promisify({
            sql: `SELECT * FROM myzone.featured_post_group where createdBy=? and label=?;`,
            values: [createdBy, label]
        })
        return newAlbum
    }
    static async addPhotoToFeaturedAlbum({ groupId, photoURL }) {
        Promisify({
            sql: `UPDATE myzone.featured_post_group SET numPosts = numPosts+1,
            initialPhoto=?
            WHERE Id=?;`,
            values: [groupId, photoURL]
        })
        return await Promisify({
            sql: `INSERT INTO myzone.featured_post (groupId, photoURL) VALUES (?,?);`,
            values: [groupId, photoURL]
        })
    }
    static async removePhotoFromFeaturedAlbum(albumName, photo) { }
}
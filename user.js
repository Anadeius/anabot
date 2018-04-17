const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
mongoose.connect('mongodb://localhost:27017/app');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log('MongoDB connected');
});
autoIncrement.initialize(db);

const userSchema = mongoose.Schema({
    _id: String,
    username: String,
    tag: String,
    discord_joined: String,
    server_joined: String,
    role: Array
});

userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'memberID' });

const User = mongoose.model('User', userSchema);

const { DateTime } = require('luxon');

/**
 * Function to create new User in Database.    
 * 
 * @param {Snowflake} id
 * @param {String} username
 * @param {String} tag
 * @param {Date} joined_discord
 * @param {Date} joined_server
 * 
 * @returns {Promise} Promise which returns a confirmation String on the success/failure of adding the user to the database
 */
const createUser = (id, username, tag, joined_discord, joined_server) => {
    return new Promise((resolve, reject) => {
        let user = new User({
            _id : id,
            username : username, 
            tag : tag,
            joined_discord : joined_discord,
            joined_server : joined_server,
        })

        user.save((err, user) =>{
            if (err) reject('User could not be added to DB');
            resolve('User added to DB successfully');
        });
    });
}

/**
 * Function to find a user in Database.
 * 
 * @param {Snowflake} userID 
 * 
 * @returns {Promise} Promise which returns a string error message or found user object.
 */
const findUser = userID => {
    return new Promise((resolve, reject) => {
        User.find({ _id : userID }, (err, userObj) => {
            if (!userObj.length) reject('User not found in database');
            resolve(userObj);
        });
    })
}

const removeUser = userID => {
    return new Promise((resolve, reject) => {
        User.findByIdAndRemove(userID, (err, user) => {
            if(err) reject(`User ${ userID } not found`);
            resolve(`User ${ user._id } removed successfully`);
        });
    });
}

/*
    id = Discord ID
    tag = Discord Username+Deliminator
    joined_discord = Date that discord account was created
    joined_server = Date that discord account joined current server
    roles = currently assigned roles on server
    
    Points System - build before implementation
        Level = Current User Level based on configured details, defaults to 1
        XP = Current XP that associates to level, defaults to 0
        Points = Current amount of server configured currency
        
*/

module.exports = {
    createUser : createUser,
    findUser : findUser,
    removeUser : removeUser
}
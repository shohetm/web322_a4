/********************************************************************************
* WEB322 – Assignment 06
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Mike Shohet Student ID: 146462197 Date: 08-08-2024
*
* Published URL: https://web322-a4.vercel.app/
*
********************************************************************************/

require("dotenv").config();

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB)



let userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    loginHistory: [ 
        { 
            dateTime: {
                type: Date,
                required: true
            },
            userAgent: {
                type: String,
                required: true
            }
    }]
});

const User = mongoose.model('User', userSchema);

module.exports.registerUser = async function(userData) {
    try {
        if (userData.password !== userData.password2) {
            throw "Passwords do not match";
        }

       const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(userData.password, salt); 

        let newUser = new User({
            userName: userData.userName,
            password: hashedPassword,
            email: userData.email,
            loginHistory: [
                {
                    dateTime: new Date(),
                    userAgent: userData.userAgent
                }
            ]
        });

        await newUser.save();
        return; // resolves the promise

    } catch (err) {
        if (err.code === 11000) {
            throw "User name already exists";
        } else {
            throw `There was an error creating the user: ${err}`;
        }
    }
};


module.exports.checkUser = function(userData){
    return new Promise((resolve,reject) => {
        User.findOne({ userName: userData.userName }).exec()
        .then(user => {
            if(!user) {
                return reject(`Unable to find user ${userData.userName}`);
            }
            bcrypt.compare(userData.password, user.password, (err, isMatch) => {
                if (err) return reject(`Error comparing passwords: ${err}`);
                if (!isMatch) return reject(`Incorrect password for user: ${userData.userName}`);
                
                if (user.loginHistory.length >= 8) {
                    user.loginHistory.pop();
                }
                user.loginHistory.unshift({
                    dateTime: new Date(),
                    userAgent: userData.userAgent
                });

                user.save()
                    .then(() => resolve(user))
                    .catch(err => reject(`There was an error verifying user: ${err}`));
            });
        })
        .catch(err => reject(`Unable to find user ${userData.userName}: ${err}`));
    });
};



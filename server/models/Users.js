const {UserError} = require('./error');
class Users{

    
    constructor(){
        this.users = {};
        this.usersBySocket = {};
        this.usernameRE = /^[\w!.\?\~][\w!.\?\~@ ]{0,30}[\w!.\?\~]$/i
    }

    hasUser(username){
        return this.users.hasOwnProperty(username);
    }

    validateUsername(username){
        return this.usernameRE.test(username);
    }
    addUser(username, socketId){
        if(this.hasUser(username)){
            throw new UserExistsError(username);
        }
        else if(!this.validateUsername(username)){
            throw new InvalidUserError(username);
        }
        this.users[username] = socketId;
        this.usersBySocket[socketId] = username;
    }

    getSocketId(username){
        if(!this.hasUser(username)){
            throw new Error(`User: ${username} is not a registered user.`);
        }
        return this.users[username];
    }

    getUsernameBySocketId(socketId){
        if(!this.usersBySocket.hasOwnProperty(socketId)){
            throw new InvalidSocketIdError(socketId);
        }
        return this.usersBySocket[socketId];
    }

    removeUser(username){
        const socketId = this.users[username];
        delete this.usersBySocket[socketId];
        delete this.users[username];
    }

    removeUserBySocketId(socketId){
        const username = this.usersBySocket[socketId];
        delete this.users[username];
        delete this.usersBySocket[socketId];
    }

    getAllUsers(){
        return {...this.users};
    }

    getValidationConfig(){
        return {usernameRegex: this.usernameRE};
    }
}

class UserExistsError extends UserError{

    constructor(username){
        super(`Username ${username} has been taken.`);
    }
}

class InvalidUserError extends UserError{

    constructor(username){
        super(`Username: ${username} is invalid.`);
    }
}

class InvalidSocketIdError extends UserError{
    
    constructor(socketId){
        super(`Socket:  ${socketId} has no user associated with it.`);
    }
}

module.exports.Users = Users;
module.exports.UserExistsError = UserExistsError;
module.exports.InvalidUserError = InvalidUserError;
module.exports.InvalidSocketIdError = InvalidSocketIdError;
class Users{

    usernameRE = /^[\w!.\?\~][\w!.\?\~@ ]{0,30}[\w!.\?\~]$/i
    constructor(){
        this.users = {};
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
    }

    getSocketId(username){
        if(!this.hasUser(username)){
            throw new Error(`User: ${username} is not a registered user.`);
        }
        return this.users[username];
    }

    removeUser(username){
        delete this.users[username];
    }

    getAllUsers(){
        return {...this.users};
    }
}

class UserExistsError extends Error{

    constructor(username){
        super(`Username ${username} has been taken.`);
    }
}

class InvalidUserError extends Error{

    constructor(username){
        super(`Username: ${username} is invalid.`);
    }
}

module.exports.Users = Users;
module.exports.UserExistsError = UserExistsError;
module.exports.InvalidUserError = InvalidUserError;
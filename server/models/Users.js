class Users{

    constructor(){
        this.users = {};
    }

    hasUser(username){
        return this.users.hasOwnProperty(username);
    }
    addUser(username, socketId){
        if(this.hasUser(username)){
            return false;
        }
        this.users[username] = socketId;
        return true;
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

module.exports.Users = Users;

class User {
    constructor(email, pass) {
        this.email = email;
        this.password = pass;
    }

    getID() {
        return this.userID;
    }

    getJSON() {
        return {
            id: this.userID,
            email: this.email
        }
    }
}

module.exports = User;
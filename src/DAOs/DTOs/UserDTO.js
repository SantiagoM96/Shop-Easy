class UserDTO {
    constructor(first_name, last_name, age) {
        this.fullName = `${first_name}${last_name}`;
        this.age = age;
    }
}

module.exports = UserDTO;
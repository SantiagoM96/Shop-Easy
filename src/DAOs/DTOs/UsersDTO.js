class UsersDTO {
    constructor(users) {
        this.users = users.map(user => ({
            id: user._id ? user._id.toString() : user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email ? user.email : user.first_name,
            role: user.role
        }));
    }
}

module.exports = UsersDTO;
const { Role } = require('../models/role');

exports.createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const role = new Role({ name, permissions });
        await role.save();
        res.status(201).send(role);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.createRoles = async (req, res) => {
    try {
        let roles = []
        const roleArr = req.body;
        for (let roleObj of roleArr) {
            let { name, permissions } = roleObj
            const role = new Role({ name, permissions });
            await role.save();
            roles.push(role)
        }
        res.status(201).send(roles);
    } catch (err) {
        res.status(400).send(err);
    }
};
const mongoose = require('mongoose');
const { Schema } = mongoose;

const permissionsSchema = new Schema({
  editContent: { type: Boolean, required: true, default: false },
  editTitle: { type: Boolean, required: true, default: false },
  deleteDocument: { type: Boolean, required: true, default: false },
  addUserRoles: { type: Boolean, required: true, default: false }
}, { _id: false });

const Permissions = mongoose.model('Permissions',permissionsSchema);

const roleSchema = new Schema({
  name: { type: String, required: true},
  permissions: { type: permissionsSchema, required: true }
});

const Role = mongoose.model('Role', roleSchema);
module.exports = { Permissions, Role }
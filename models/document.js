const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Role } = require("../models/role")

const userRoleSchema = new Schema({
  userId : { type: String, required: true },  
  userName: { type: String, required: true },
  userEmail : { type: String, required: true },
  role: { type: Role.schema, required: true }
}, { _id: false });

const UserRole = mongoose.model('UserRole',userRoleSchema);

const documentSchema = new Schema({  
  title: { type: String, required: true },
  content: { type: String, required: true },
  userRoles: [{ type: UserRole.schema, required: true }]
});

const Document = mongoose.model('Document', documentSchema);

module.exports = { UserRole, Document }
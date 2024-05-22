const { UserRole, Document } = require('../models/document');

exports.createDocument = async (req, res) => {
  try {
    const { title, content, userRoles } = req.body;
    const document = new Document({ title, content, userRoles });
    await document.save();
    res.status(201).send(document);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.addUserRoleToDocument = async (req, res) => {
  try {
    const { documentId, userRoleObj } = req.body;
    if (!documentId || !userRoleObj) {
      return res.status(400).send('Document ID and User Role are required.');
    }
    const document = await Document.findById(documentId);
    if (!document) { return res.status(404).send('Document not found.'); }
    const existingUserRoleIndex = document.userRoles.findIndex((role) => role.userId === userRoleObj.userId);
    if (existingUserRoleIndex !== -1) {
      const existingUserRole = document.userRoles[existingUserRoleIndex];
      if (existingUserRole.role._id.toString() !== userRoleObj.role._id.toString()) {
        // Update the existing user role with the new role
        document.userRoles[existingUserRoleIndex].role = userRoleObj.role;
        const updatedDocument = await document.save();
        return res.status(200).send(updatedDocument);
      } else {
        return res.status(400).send('User Role already present with the same role.');
      }
    } else {
      // Add new user role if it doesn't exist
      const userRole = new UserRole(userRoleObj);
      document.userRoles.push(userRole);
      const updatedDocument = await document.save();
      res.status(201).send(updatedDocument);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};
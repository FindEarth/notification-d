const ObjectId = require('mongodb').ObjectId;

const geo = {
  loc   : [-58.381276, -34.604703],
  raduis: 100
};

const notificationSet1 = {
  _id         : new ObjectId('12a3d077c143c921072e342a'),
  name        : 'Notification Foo',
  body        : 'Notification Foo message',
  sentAt      : new Date(),
  type        : 'push',
  organization: new ObjectId('12a3d077c143c921012e340a'),
  users       : ['12a3d077c143c921072e343c', '12a3d077c143c921072e345c'],
  geo
};


module.exports = notificationSet1;

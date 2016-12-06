const ObjectId = require('mongodb').ObjectId;

const geo = {
  loc   : [-58.381276, -34.604703],
  raduis: 100
};

const Bundle1 = {
  _id         : new ObjectId('12a3d077c143c921072e342a'),
  title       : 'Notification Foo',
  message     : 'Notification Foo message',
  users       : [new ObjectId('12a3d077c143c921072e343c'), new ObjectId('12a3d077c143c921072e345c')],
  organization: new ObjectId('12a3d077c143c921012e340a'),
  // createdBy   : { type : String },
  // status      : { type : Boolean },
  sentAt      : new Date(),
  type        : 'push',
  geo
};


module.exports = Bundle1;

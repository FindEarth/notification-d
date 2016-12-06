const geo = {
  loc   : [-58.381276, -34.604703],
  raduis: 100
};

const newNotificationSet1 = {
  title       : 'Notification Foo',
  message     : 'Notification Foo message',
  users       : ['12a3d077c143c921072e343c', '12a3d077c143c921072e345c'],
  organization: '12a3d077c143c921012e340a',
  // createdBy   : { type : String },
  // status      : { type : Boolean },
  sentAt      : new Date(),
  type        : 'push',
  geo
};


module.exports = newNotificationSet1;


const geo = {
  loc   : [-58.381276, -34.604703],
  raduis: 100
};

const newNotificationSet1 = {
  name        : 'Notification Foo',
  body        : 'Notification Foo message',
  sentAt      : new Date(),
  organization: '12a3d077c143c921012e340a',
  type        : 'push',
  users       : ['12a3d077c143c921072e343c', '12a3d077c143c921072e345c'],
  geo
};


module.exports = newNotificationSet1;

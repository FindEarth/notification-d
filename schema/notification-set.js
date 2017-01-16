const Schema   = require('mongoose').Schema;
const ObjectId = Schema.Types.ObjectId;

const validators   = {
  location: {
    validator(v) { return v.length === 2; },
    message: '{VALUE} is not a valid location'
  }
};

const geo = {
  loc   : { type: [Number], index: '2dsphere', required: false, validate: validators.location },
  raduis: { type: Number }
};

const statusEnum = ['success', 'pending', 'failed'];
const typeEnum   = ['push', 'sms', 'email'];

const NotificationSetSchema = new Schema({
  name        : { type : String, required: true },
  title       : { type : String },
  body        : { type : String },
  users       : { type : [String] },
  createdBy   : { type : String },
  status      : { type : String, enum: statusEnum, default: 'pending' },
  sentAt      : { type : Date },
  scheduledAt : { type : Date },
  organization: { type : ObjectId },
  type        : { type : String, enum: typeEnum, default: 'email' },
  geo
});


module.exports = NotificationSetSchema;

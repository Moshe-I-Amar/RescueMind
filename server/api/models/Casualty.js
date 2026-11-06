const mongoose = require('mongoose');
const catalog = require('../../domain/catalog');

const { Schema } = mongoose;
const codes = catalog.codesOf;
const ACTION_CODES = Object.keys(catalog.ACTIONS_BY_CODE);
const CATEGORY_CODES = codes(catalog.MARCH);

const injurySchema = new Schema({
  type: { type: String, enum: codes(catalog.INJURY_TYPES), required: true },
  location: { type: String, enum: codes(catalog.BODY_LOCATIONS), required: true },
  severity: { type: String, enum: codes(catalog.SEVERITIES), default: 'moderate' },
});

const treatmentSchema = new Schema({
  category: { type: String, enum: CATEGORY_CODES, required: true },
  action: { type: String, enum: ACTION_CODES, required: true },
  site: { type: String },
  note: { type: String, trim: true },
  performedAt: { type: Date, default: Date.now },
});

const vitalsSchema = new Schema({
  heartRate: Number,
  oxygenLevel: Number,
  systolic: Number,
  diastolic: Number,
  respiratoryRate: Number,
  avpu: { type: String, enum: codes(catalog.AVPU) },
  recordedAt: { type: Date, default: Date.now },
});

const casualtySchema = new Schema(
  {
    number: { type: Number, required: true, unique: true },
    name: { type: String, trim: true },
    priority: { type: String, enum: codes(catalog.PRIORITIES), required: true },
    status: { type: String, enum: codes(catalog.STATUSES), default: 'active' },
    mechanism: { type: String, enum: codes(catalog.MECHANISMS) },
    injuryTime: { type: Date, default: Date.now },
    injuries: [injurySchema],
    treatments: [treatmentSchema],
    vitals: [vitalsSchema],
  },
  { timestamps: true }
);

/** Expose `id` instead of `_id`/`__v` on the casualty and every sub-document. */
const toPlain = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
};
[casualtySchema, injurySchema, treatmentSchema, vitalsSchema].forEach((s) => s.set('toObject', toPlain));

const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });

module.exports = {
  Casualty: mongoose.model('Casualty', casualtySchema),
  Counter: mongoose.models.Counter || mongoose.model('Counter', counterSchema),
};

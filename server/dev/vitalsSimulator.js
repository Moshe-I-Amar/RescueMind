/**
 * Development stand-in for wearable sensors: every interval, appends a small
 * random-walk reading for each active casualty that already has vitals
 * (casualties without readings are treated as "no sensor paired").
 */
const METRICS = {
  heartRate: { step: 4, min: 30, max: 180 },
  oxygenLevel: { step: 1, min: 70, max: 100 },
  systolic: { step: 4, min: 50, max: 190 },
  diastolic: { step: 3, min: 30, max: 120 },
  respiratoryRate: { step: 1, min: 6, max: 40 },
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const drift = (value, { step, min, max }) =>
  clamp(Math.round(value + (Math.random() * 2 - 1) * step), min, max);

function nextReading(last) {
  const reading = {};
  for (const [metric, range] of Object.entries(METRICS)) {
    if (typeof last[metric] === 'number') reading[metric] = drift(last[metric], range);
  }
  if (last.avpu) reading.avpu = last.avpu;
  return reading;
}

function startVitalsSimulator(service, intervalMs = 5000) {
  console.log(`Vitals simulator running every ${intervalMs / 1000}s`);
  return setInterval(async () => {
    try {
      const casualties = await service.list({ status: 'active' });
      await Promise.all(
        casualties
          .filter((c) => c.latestVitals)
          .map((c) => service.addVitals(c.id, nextReading(c.latestVitals)))
      );
    } catch (err) {
      console.error('Vitals simulator error:', err.message);
    }
  }, intervalMs);
}

module.exports = startVitalsSimulator;

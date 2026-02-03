export function classifyZone(trajectory) {
  if (!trajectory || trajectory.length < 10) return 'Unknown';

  const zs = trajectory.map(p => p.z || 0);
  const avgZ = zs.reduce((a, b) => a + b, 0) / zs.length;
  const duration = (trajectory[trajectory.length - 1].t - trajectory[0].t) / 1000;

  if (duration > 180 && avgZ < -1) return 'Pit Area';
  if (duration > 180 && avgZ > 1) return 'Machine Room';
  if (duration > 120 && Math.abs(avgZ) < 0.5) return 'Car Top';
  return 'Landing Area';
}

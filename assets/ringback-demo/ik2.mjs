// Adapted from huashu-art-motion RIG.ik2; see ADAPTATION.md and LICENSE-HUASHU.
export function ik2(S, T, a, b, bendSign = 1) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  const d = Math.max(Math.abs(a - b) + 1e-6, Math.min(Math.hypot(dx, dy), a + b - 1e-6));
  const ang = Math.atan2(dy, dx);
  const cosA = Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)));
  const e = ang + bendSign * Math.acos(cosA);
  return {
    E: [S[0] + Math.cos(e) * a, S[1] + Math.sin(e) * a],
    H: [S[0] + Math.cos(ang) * d, S[1] + Math.sin(ang) * d],
  };
}

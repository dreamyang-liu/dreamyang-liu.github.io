// Invariant check for the dpattn-flow routing table. Keep this `route` in sync
// with the `route` constant in dpattn-flow.html.
// Run: node themes/VSC4T/source/anim/extra/dpattn-flow.route-check.mjs
const N = 4, TOK = 3, EXPERTS = 8;
const route = [[1,3,4],[2,5,7],[0,3,6],[1,4,7]];

let ok = true;
function fail(msg) { console.error('FAIL: ' + msg); ok = false; }

if (route.length !== N) fail(`expected ${N} sequences, got ${route.length}`);
route.forEach((r, g) => {
  if (r.length !== TOK) fail(`seq ${g}: expected ${TOK} tokens, got ${r.length}`);
  r.forEach((e) => { if (!Number.isInteger(e) || e < 0 || e >= EXPERTS) fail(`seq ${g}: bad expert id ${e}`); });
  const destGpus = new Set(r.map((e) => e >> 1));
  if (destGpus.size < 2) fail(`seq ${g}: tokens only reach ${destGpus.size} GPU(s); need >=2 for a meaningful All-to-All`);
});

console.log(ok ? 'OK: routing invariants hold' : 'FAILED');
process.exit(ok ? 0 : 1);

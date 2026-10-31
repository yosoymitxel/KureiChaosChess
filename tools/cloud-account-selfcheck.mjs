import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL('../' + path, import.meta.url));

const settings = read('src/ui/screens/setup.js');
const app = read('src/ui/app.js');
const account = read('src/ui/screens/account.js');
const api = read('src/game/cloud-api.js');
const sync = read('src/game/cloud-sync.js');
const html = read('index.html');
const migration = read('supabase/migrations/20261031232148_grant_delete_game_saves.sql');

assert.ok(settings.includes('Cuenta y guardado en la nube'), 'Settings must expose the player account');
assert.ok(settings.includes('window.self === window.top'), 'Account UI must be available on static top-level pages');
assert.ok(!settings.includes('.workers.dev'), 'Account UI must not depend on a Worker hostname');
assert.ok(app.includes("screen === 'account'") && app.includes('AccountScreen'), 'Account route must be wired');
assert.ok(account.includes('Subir dispositivo a la nube'));
assert.ok(account.includes('Descargar nube a este dispositivo'));
assert.ok(account.includes('Logros') && account.includes('Estadísticas registradas'));
assert.ok(account.includes('Tres ranuras independientes'));

assert.ok(html.includes('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0'), 'The pinned Supabase SDK must load before the game module');
assert.ok(api.includes('globalThis.supabase?.createClient'), 'The browser must instantiate the official Supabase client');
assert.ok(api.includes('.auth.signInWithOtp(') && api.includes('.auth.verifyOtp('), 'Email OTP must use Supabase Auth directly');
assert.ok(api.includes(".from('game_saves')") && api.includes(".rpc('delete_game_save'"), 'Cloud saves must use Supabase Data API directly');
assert.ok(!api.includes('/api/') && !api.includes('fetch('), 'The game must not call a same-origin backend');
assert.ok(!api.includes('service_role') && !api.includes('secret_'), 'No privileged key may be shipped to the browser');

assert.ok(sync.includes('window.self !== window.top'), 'Embedded itch.io builds must remain local');
assert.ok(sync.includes('result.saves || []'), 'Autosync must read the listSaves result shape');
assert.ok(sync.includes('updated.save.revision'), 'Autosync must read the saveSlot result shape');
assert.ok(!sync.includes('.workers.dev') && !sync.includes('/api/'), 'Autosync must not depend on a Worker');
assert.ok(migration.toLowerCase().includes('grant delete on table public.game_saves to authenticated'), 'Revision-checked deletion needs the authenticated SQL grant');
assert.ok(exists('supabase/migrations/20261031232148_grant_delete_game_saves.sql'));
assert.ok(!exists('worker/index.js') && !exists('wrangler.jsonc'), 'Worker implementation must be removed');
assert.ok(!exists('.github/workflows/deploy-cloudflare.yml'), 'Worker deployment workflow must be removed');

console.log('Cloud account checks passed: direct Supabase Auth/Data API, static-host support, RLS-backed saves, revision conflicts and embedded local mode.');

#!/usr/bin/env node
// PreToolUse(Read): bloquea leer entero un archivo grande (> READ_GUARD_KB, 40 por defecto)
// si no se pasa offset/limit. No escribe nada, no usa red. Desactivar: READ_GUARD_OFF=1.
import fs from 'node:fs';
if (process.env.READ_GUARD_OFF === '1') process.exit(0);
let raw = '';
try { raw = fs.readFileSync(0, 'utf8'); } catch { process.exit(0); }
let p; try { p = JSON.parse(raw); } catch { process.exit(0); }
if (p.tool_name !== 'Read') process.exit(0);
const i = p.tool_input || {};
if (i.offset != null || i.limit != null) process.exit(0);
const f = i.file_path; if (!f) process.exit(0);
if (/\.(png|jpe?g|gif|webp|pdf|ipynb)$/i.test(f)) process.exit(0); // imágenes/PDF van aparte
let size = 0; try { size = fs.statSync(f).size; } catch { process.exit(0); }
const max = (Number(process.env.READ_GUARD_KB) || 40) * 1024;
if (size <= max) process.exit(0);
let lines = 0; try { lines = fs.readFileSync(f, 'utf8').split('\n').length; } catch {}
process.stderr.write(`Read bloqueado: ${f} pesa ${Math.round(size/1024)} KB (~${Math.round(size/4)} tokens, ${lines} líneas). ` +
  `Usa grep -n para localizar y Read con offset/limit (o sed -n 'a,bp') para leer solo ese tramo.\n`);
process.exit(2);

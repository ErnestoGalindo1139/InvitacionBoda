import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

// Exercise the real component's initial render with the existing dependencies.
// Browser interactions and CSS motion still require the manual checks in the guide.
const source = readFileSync(
  new URL(
    '../src/TiendaOnline/components/InvitationIntro/InvitationIntro.tsx',
    import.meta.url
  ),
  'utf8'
).replace("import './InvitationIntro.css';", '');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;
const require = createRequire(import.meta.url);

const render = (storage) => {
  const exports = {};
  vm.runInNewContext(compiled, { exports, require, sessionStorage: storage });
  return renderToStaticMarkup(
    React.createElement(
      exports.InvitationIntro,
      {
        novia: 'Alejandra',
        novio: 'Dionisio',
        fecha: '12 de Diciembre de 2026',
        photo: '/img/boda/alejandra&dionicio-38.png',
      },
      React.createElement('h1', null, 'Contenido de la invitación')
    )
  );
};

test('a new session presents a semantic opening control and hides the page from assistive technology', () => {
  const html = render({ getItem: () => null });
  assert.match(html, /data-invitation="closed"/);
  assert.match(
    html,
    /<button[^>]*type="button"[^>]*aria-label="Abrir la invitación de Alejandra y Dionisio"/
  );
  assert.match(html, /class="invitation-content" aria-hidden="true"/);
  assert.match(html, /Contenido de la invitación/);
});

test('a previously opened session still presents the closed envelope without reading storage', () => {
  let reads = 0;
  const html = render({
    getItem: () => {
      reads += 1;
      return 'true';
    },
  });
  assert.equal(reads, 0);
  assert.match(html, /data-invitation="closed"/);
  assert.match(html, /class="invitation-intro"/);
  assert.match(html, /Toca para abrir/);
});

test('unavailable storage does not prevent the invitation from rendering', () => {
  const html = render({
    getItem: () => {
      throw new Error('Storage blocked');
    },
  });
  assert.match(html, /data-invitation="closed"/);
  assert.match(html, /Toca para abrir/);
});

test('every fresh mount starts closed regardless of previous storage values', () => {
  for (const value of ['true', 'false', '', 'undefined']) {
    assert.match(render({ getItem: () => value }), /data-invitation="closed"/);
  }
});

// UI runtime: Preact + htm (JSX-like templates with no build step), Motion for DOM springs.
import { h, render, Fragment } from 'preact';
import htm from 'htm';
export const html = htm.bind(h);
export { render, Fragment };
export { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'preact/hooks';
export { animate as motion, stagger as motionStagger } from 'motion';

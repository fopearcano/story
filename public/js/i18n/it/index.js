// Italian dictionary, one fragment per area of the app. Keys are the English
// source strings used with t(), tn() and rich().
import app from './app.js';
import doctor from './doctor.js';
import elements from './elements.js';
import design from './design.js';
import craft from './craft.js';
import charts from './charts.js';
import ai from './ai.js';
import server from './server.js';

export const FRAGMENTS = { app, doctor, elements, design, craft, charts, ai, server };
export default Object.assign({}, ...Object.values(FRAGMENTS));

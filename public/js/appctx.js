// App-level context (AI drawer control, AI status) shared by views.
import { createContext, useContext } from './lib.js';

export const AppCtx = createContext({ openAi: () => {}, ai: { envKey: false, model: '' } });
export const useApp = () => useContext(AppCtx);

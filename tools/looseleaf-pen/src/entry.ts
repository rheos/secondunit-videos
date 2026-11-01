// Browser entry: window.LLPen = { stroke, dot, makeRng, pen, PENS }
import { stroke, dot } from './pen'
import { makeRng } from './rng'
import { pen, PENS } from './pens'
;(globalThis as any).LLPen = { stroke, dot, makeRng, pen, PENS }

// skins/s05.js: the table and section 5 (the table city). The code is js/skin.js (buildTable): the room, the cloth, the
// candle and its light, the place setting, the standees, the fence. It is built and updated FIRST, before sections 1 to 4,
// because every section stands on this table. Its pieces are in the registry as section 5.
import { buildTable } from "../skin.js";
export const build = (X) => buildTable(X);

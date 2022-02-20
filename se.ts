import { gzipSync, gunzipSync } from 'zlib';
import axios from 'axios';
import { promises as fs } from 'fs';

async function main() {
    const engine = await (await axios.get('https://servers.purplepalette.net/engines/pjsekai')).data.item;
    const effectData = gunzipSync((await axios.get('https://servers.purplepalette.net' + engine.effect.data.url, { responseType: 'arraybuffer' })).data).toString();
    const modifiedEffectData = effectData.replace(/"\//g, '"https://servers.purplepalette.net/');
    await fs.writeFile('public/se.gz', gzipSync(modifiedEffectData));
}

main()

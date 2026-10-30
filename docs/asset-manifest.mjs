import {scenes,modals} from './story.mjs?v=37';

// Active scene/background/canvas/dialog assets only; old design variants are
// deliberately excluded. Shared URLs reuse the browser's normal image cache.
const rendererImages=[
 'back.webp','iceberg_3.webp','water.webp','mask.png',
 'foreground-open-v24.webp','foreground-ice-v24.webp',
 'research-station.webp','research-pier-v4.webp','ship-approach-v30.webp',
 'shore-ground-v10.webp','antarctic-coast-v4.webp',
 'tourists-v18.webp','jellyfish-v5.webp','krill-v6.webp',
 'albatross-near-v14.webp','albatross-fish-v32.webp',
 'underice-v14.webp','leopard-v15.webp','fish-v14.webp','seaweed-v14.webp',
 'tern-underwater-v17.webp','breach-spray-v16.webp','orca-water-2.webp','whale-water.webp'
];
export const imageAssets=[...new Set([
 ...scenes.map(s=>s.image),...Object.values(modals).map(m=>m.image),...rendererImages
].filter(Boolean))];
export const fontAssets=['700 16px LINESeedJP','600 16px Moderustic','600 16px Inter'];

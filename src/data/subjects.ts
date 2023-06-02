import { uniqueId, map, merge } from 'lodash';

export const development = map(
  merge(Array(20), [
    'Front-end',
    'Javascript',
    'React',
    'Typescript',
    'DevOPS',
    'Testing',
    'Management',
    'Soft Skills',
    'Well-being',
    'Webflow',
  ]),
  (value) => ({ id: uniqueId(), value })
);

export const design = map(
  merge(Array(20), [
    'Figma',
    'UX',
    'Product',
    'Design System',
    'Graphic design',
    'Icons & Illustrations',
    'Motion',
    '3D',
    'UX Writing',
    'Workshops',
    'User Research',
    'Management',
    'Soft Skills',
    'Well-being',
  ]),
  (value) => ({ id: uniqueId(), value })
);

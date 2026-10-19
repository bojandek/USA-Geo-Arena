export const MAP_STYLES = [
  {
    id: 'voyager',
    name: 'Voyager',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Clean, colorful base map with labels'
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark theme for better contrast'
  },
  {
    id: 'positron',
    name: 'Positron',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Light, minimalist base map'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://basemaps.cartocdn.com/gl/satellite-gl-style/style.json',
    description: 'Satellite imagery with labels'
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://basemaps.cartocdn.com/gl/terrain-gl-style/style.json',
    description: 'Terrain base map with elevation data'
  }
];

export const getMapStyleById = (id: string) => {
  return MAP_STYLES.find(style => style.id === id) || MAP_STYLES[0];
};

export const getDefaultMapStyleId = () => {
  return localStorage.getItem('mapStyle') || 'voyager';
};

export const saveMapStylePreference = (id: string) => {
  localStorage.setItem('mapStyle', id);
};
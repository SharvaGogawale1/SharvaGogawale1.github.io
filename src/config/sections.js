import About from '../components/About';
import News from '../components/News';
import Research from '../components/Research';

export const sections = [
  {
    id: 'about',
    label: 'About',
    component: About,
  },
  {
    id: 'news',
    label: 'News & Updates',
    component: News,
  },
  {
    id: 'publications',
    label: 'Publications',
    component: Research,
  },
];

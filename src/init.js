import Example from './Example';
import Rss from './Rss';

export default () => {
  const element = document.getElementById('point');
  const obj = new Example(element);

  const formPoint = document.getElementById('form');
  const form = new Rss(formPoint);
  obj.init();
  form.init();
};

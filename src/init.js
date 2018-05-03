import Rss from './Rss';

export default () => {
  const formPoint = document.getElementById('form-mount');
  const form = new Rss(formPoint);
  form.init();
};

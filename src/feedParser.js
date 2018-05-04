import uuid from 'uuid/v1';

export const handlingDoc = (doc) => {
  const feedName = doc.querySelector('title');
  const feedLink = doc.querySelector('link');
  const newsItems = [...doc.querySelectorAll('item')];
  const preparedNews = newsItems.map((item) => {
    const title = item.querySelector('title');
    const link = item.querySelector('link');
    const desc = item.querySelector('description');
    return title && link && desc ?
      {
        id: uuid(),
        feedName: feedName.textContent,
        feedLink: feedLink.textContent,
        title: title.textContent,
        link: link.textContent,
        desc: desc.textContent,
      } : null;
  }).filter(item => !!item);
  return preparedNews;
}
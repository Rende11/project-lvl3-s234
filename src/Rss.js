// @flow
import _ from 'lodash';
import axios from 'axios';
import validator from 'validator';

export default class Rss {
  constructor(element) {
    this.proxy = 'https://cors-anywhere.herokuapp.com/';
    this.element = element;
    this.storage = [];
    this.feeds = [];
  }

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { linkInput } = _.fromPairs([...new FormData(e.target)]);
    const input = e.target.querySelector('#link');
    if (!this.validateInput(linkInput)) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
      this.storage.push(linkInput);
      input.value = '';

      axios.get(this.proxy + linkInput)
        .then((data) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.data, 'application/xml');
          this.feeds.push(doc);
          this.drawRsslist();
        })
        .catch((err) => {
          console.error(err);
          input.classList.add('is-invalid');
        });
    }
  }

  handlingDoc = (doc) => {
    const titles = [...doc.querySelectorAll('item > title')].map(node => node.textContent);
    const links = [...doc.querySelectorAll('item > link')].map(node => node.textContent);
    const descs = [...doc.querySelectorAll('item > description')].map(node => node.textContent);
    const zipped = _.zip(titles, links, descs);
    return zipped.map((item) => {
      const [title, link, desc] = item;
      return ({ title, link, desc });
    }).filter(item => item.title && item.link && item.desc);
  }

  init() {
    this.element.innerHTML =

    `<div id="form">
      <form>
        <div class="input-group mb-3">
          <input type="text" id="link" name="linkInput" class="form-control"
            placeholder="rss link" aria-label="rss link" aria-describedby="basic-addon2">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="submit">Go!</button>
          </div>
          <div class="invalid-feedback">
            Invalid or already used url - request failed
          </div>
        </div>
      </form>
      <div id="rss-list">
    </div>`;

    const form = this.element.querySelector('form');

    form.addEventListener('submit', this.handleOnSubmit);
  }

  drawRsslist() {
    if (this.feeds.length > 0) {
      const parsed = this.feeds.map(feed => this.handlingDoc(feed));
      const converted = parsed.map(parsedFeed => this.convertFeed(parsedFeed));
      const htmlFeed = _.flatten(converted).reverse().join('<hr />');
      this.element.querySelector('#rss-list').innerHTML = htmlFeed;
    }
  }

  convertFeed = (parsedFeed) => {
    const items = parsedFeed.map(el => `<a href="${el.link}" class="list-group-item list-group-item-action">${el.title}</a>`).join('');
    return `<div class="list-group" id="list">${items}</div>`;
  }

  validateInput(url) {
    return (url.includes('localhost') || (validator.isURL(url) && !this.storage.includes(url)));
  }
}

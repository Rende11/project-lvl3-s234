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

  handleOnClick = (e) => {
    if (e.target.dataset.type === "modal-button") {
      e.preventDefault();
    }
  }

  handlingDoc = (doc) => {
    const newsItems = [...doc.querySelectorAll('item')];

    const preparedNews = newsItems.map((item) => {
      const title = item.querySelector('title');
      const link = item.querySelector('link');
      const desc = item.querySelector('description');
      return title && link && desc ?
        { title: title.textContent, link: link.textContent, desc: desc.textContent } : null;
    }).filter(item => !!item);

    return preparedNews;
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
    const rss = this.element.querySelector('#rss-list');

    form.addEventListener('submit', this.handleOnSubmit);
    rss.addEventListener('click', this.handleOnClick);
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
    const items = parsedFeed.map(el => 
      `<a href="${el.link}" class="list-group-item list-group-item-action clearfix">
        ${el.title}
        <span class="float-right">
          <button class="btn btn-xs btn-default" data-type="modal-button">Show description</button>
        </span>
      </a>`).join('');
    return `<div class="list-group" id="list">${items}</div>`;
  }

  validateInput(url) {
    return (url.includes('localhost') || (validator.isURL(url) && !this.storage.includes(url)));
  }
}

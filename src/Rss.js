// @flow
import _ from 'lodash';
import axios from 'axios';
import validator from 'validator';

export default class Rss {
  constructor(element) {
    this.proxy = 'https://cors-anywhere.herokuapp.com';
    this.element = element;
    this.newsFeed = [];
  }

  stateChange = {
    failed: (el) => {
      el.classList.add('is-invalid');
      el.classList.remove('is-valid');
    },
    success: (el) => {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
    },
    neutral: (el) => {
      el.classList.remove('is-invalid');
      el.classList.remove('is-valid');
    },
  }

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { linkInput } = _.fromPairs([...new FormData(e.target)]);
    const input = document.getElementById('link');
    if (!this.validateInput(linkInput)) {
      this.stateChange.failed(input);
    } else {
      this.stateChange.success(input);
      axios.get(`${this.proxy}/${linkInput}`)
        .then((data) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.data, 'application/xml');

          const parsedNews = this.handlingDoc(doc);

          if (parsedNews.length === 0) {
            throw new Error("Can't parse news from this url");
          }

          this.newsFeed.push({
            url: linkInput,
            news: parsedNews,
          });

          this.drawRsslist();
          input.value = '';
          this.stateChange.neutral(input);
        })
        .catch((err) => {
          console.error(err);
          this.stateChange.failed(input);
        });
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
      <form id="feed-form">
        <div class="input-group mb-3">
          <input type="text" id="link" name="linkInput" class="form-control"
            placeholder="rss link" aria-label="rss link" aria-describedby="basic-addon2">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="submit">Go!</button>
          </div>
          <div class="invalid-feedback">
            Invalid or already used url - request failed
          </div>
          <div class="valid-feedback">
            Looks good - wait for the download
          </div>
        </div>
      </form>
      <div id="rss-list">
    </div>`;

    const form = document.getElementById('feed-form');

    form.addEventListener('submit', this.handleOnSubmit);
  }

  drawRsslist() {
    if (this.newsFeed.length > 0) {
      const converted = this.newsFeed.map(feed => this.convertFeed(feed.news));
      const htmlFeed = converted.reverse().join('<hr />');
      document.getElementById('rss-list').innerHTML = htmlFeed;
    }
  }
  convertFeed = (objFeed) => {
    const items = objFeed.map(el => `<a href="${el.link}" class="list-group-item list-group-item-action">${el.title}</a>`).join('');
    return `<div class="list-group" id="list">${items}</div>`;
  }

  validateInput(url) {
    const usedUrls = this.newsFeed.map(feed => feed.url);
    return (url.includes('localhost') || (validator.isURL(url) && !usedUrls.includes(url)));
  }
}

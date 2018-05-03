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

  stateChanger = {
    failed: (el, message) => {
      el.classList.add('is-invalid');
      el.classList.remove('is-valid');
      document.getElementById('invalid-message').textContent = message;
    },
    success: (el, message) => {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
      document.getElementById('valid-message').textContent = message;
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
      this.stateChanger.failed(input, 'Validation error - empty input, invalid or already used url');
    } else {
      this.stateChanger.success(input, 'Looks good - wait for download');
      axios.get(`${this.proxy}/${linkInput}`)
        .then((data) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.data, 'application/xml');
          const parsedNews = this.handlingDoc(doc);

          if (parsedNews.length === 0) {
            this.stateChanger.failed(input, "Can't parse news from this url");
          } else {
            this.newsFeed.push({
              url: linkInput,
              news: parsedNews,
            });

            this.drawRsslist();
            input.value = '';
            this.stateChanger.neutral(input);
          }
        })
        .catch((err) => {
          console.error(err);
          this.stateChanger.failed(input, 'Request failed');
        });
    }
  }

  handleOnClick = (e) => {
    if (e.target.dataset.type === "modal-button") {
      e.preventDefault();
    }
  }

  handlingDoc = (doc) => {
    const feedName = doc.querySelector('title');
    const feedLink = doc.querySelector('link');
    const newsItems = [...doc.querySelectorAll('item')];
    const preparedNews = newsItems.map((item) => {
      const title = item.querySelector('title');
      const link = item.querySelector('link');
      const desc = item.querySelector('description');
      return title && link && desc ?
        {
          feedName: feedName.textContent,
          feedLink: feedLink.textContent,
          title: title.textContent,
          link: link.textContent,
          desc: desc.textContent,
        } : null;
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
          <div class="invalid-feedback" id="invalid-message">
            Invalid or already used url - request failed
          </div>
          <div class="valid-feedback" id="valid-message">
            Looks good - wait for the download
          </div>
        </div>
      </form>
      <div id="rss-list">
    </div>`;

    const form = document.getElementById('feed-form');

    form.addEventListener('submit', this.handleOnSubmit);
    rss.addEventListener('click', this.handleOnClick);
  }

  drawRsslist() {
    if (this.newsFeed.length > 0) {
      const converted = this.newsFeed.map(feed => this.convertFeed(feed.news));
      const htmlFeed = converted.reverse().join('<hr />');
      document.getElementById('rss-list').innerHTML = htmlFeed;
    }
  }
  convertFeed = (objFeed) => {
    const { feedName, feedLink } = objFeed[0];
    const items = objFeed.map(el => `<a href="${el.link}" class="list-group-item list-group-item-action">${el.title}</a>`).join('');
    return `<div class="list-group" id="list">
              <a href="${feedLink || '#'}" class="list-group-item list-group-item-action active">
              ${feedName || 'Unknown feed'}</a>${items}</div>`;
  }

  validateInput(url) {
    const usedUrls = this.newsFeed.map(feed => feed.url);
    return (url.includes('localhost') || (validator.isURL(url) && !usedUrls.includes(url)));
  }
}

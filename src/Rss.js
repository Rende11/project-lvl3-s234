// @flow
import _ from 'lodash';
import axios from 'axios';
import validator from 'validator';
import $ from 'jquery';

import { getModal, getForm } from './templates';
import  stateChanger  from './utils';
import handlingDoc from './feedParser';

export default class Rss {
  constructor(element) {
    this.proxy = 'https://cors-anywhere.herokuapp.com/';
    this.element = element;
    this.newsFeed = [];
    this.isUpdaterStarted = false;
  }

  updateFeeds = () => {
    const rssLinks = this.newsFeed.map(({ url }) => url);
    Promise.all(this.newsFeed.map(({ url }) => this.getAndParseFeed(url)))
      .then((newFeedsData) => {
        const newFeedsWithUrls = newFeedsData
          .map((news, index) => ({ url: rssLinks[index], news }));
        const data = newFeedsWithUrls
          .map(feed => this.getNewArticles(feed.news, this.getFeedByUrl(feed.url).news || []));
        const newArticles = data.map((news, index) => ({ url: rssLinks[index], news }));
        const rssForUpdate = newArticles.filter(feed => feed.news.length !== 0);
        if (rssForUpdate.length > 0) {
          rssForUpdate.forEach((feed) => {
            const oldFeedState = this.getFeedByUrl(feed.url);
            oldFeedState.news = [...feed.news, ...oldFeedState.news];
          });
          const isModalOpen = document.getElementById('exampleModal').classList.contains('show');
          if (!isModalOpen) {
            this.drawRsslist();
          }
        }
      });
  }

  getFeedByUrl = url => _.find(this.newsFeed, f => f.url === url);

  getAndParseFeed = url => axios.get(`${this.proxy}${url}`)
    .then((data) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.data, 'application/xml');
      return handlingDoc(doc);
    })

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { linkInput } = _.fromPairs([...new FormData(e.target)]);
    const input = document.getElementById('link');

    if (!this.validateInput(linkInput)) {
      stateChanger.failed(input, 'Validation error - empty input, invalid or already used url');
    } else {
      stateChanger.success(input, 'Looks good - wait for download');
      this.getAndParseFeed(linkInput)
        .then((parsedNews) => {
          if (parsedNews.length === 0) {
            throw new Error('Parse error');
          } else {
            this.newsFeed.push({
              url: linkInput,
              news: parsedNews,
            });

            this.drawRsslist();
            input.value = '';
            stateChanger.neutral(input);
          }
        })
        .then(() => {
          if (!this.isUpdaterStarted) {
            this.isUpdaterStarted = true;
            setInterval(this.updateFeeds, 5000);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.message === 'Parse error') {
            stateChanger.failed(input, "Can't parse news from this url");
          } else {
            stateChanger.failed(input, 'Request failed');
          }
        });
    }
  }

  getNewsById = id => _.find(_.flatten(this.newsFeed.map(feed => feed.news)), { id });

  init() {
    this.element.innerHTML = getForm();
    const form = document.getElementById('feed-form');
    form.addEventListener('submit', this.handleOnSubmit);
  }

  drawRsslist() {
    if (this.newsFeed.length > 0) {
      const converted = this.newsFeed.map(feed => this.convertFeed(feed.news));
      const htmlFeed = converted.reverse().join('<hr />');
      const rssList = document.getElementById('rss-list');
      rssList.innerHTML = htmlFeed;
      rssList.insertAdjacentHTML('beforeend', getModal());

      $('[data-toggle="modal"]').on('click', (e) => {
        e.preventDefault();
      });

      $('#exampleModal').on('show.bs.modal', (e) => {
        const button = $(e.relatedTarget);
        const articleId = button.data('article-id');
        const article = this.getNewsById(articleId);
        const modal = $(e.currentTarget);
        modal.find('.modal-title').text(article.title);
        modal.find('.modal-body').text(article.desc);
        modal.find('a').attr('href', article.link);
      });
    }
  }

  convertFeed = (objFeed) => {
    const { feedName, feedLink } = objFeed[0];
    const items = objFeed.map(el =>
      `<a href="${el.link}" class="list-group-item list-group-item-action">
        ${el.title}
        <span class="float-right">
          <button type="button" class="btn btn-outline-secondary" data-article-id="${el.id}"
            data-toggle="modal" data-target="#exampleModal">
            Show description
          </button>
        </span>
      </a>`).join('');

    return `<div class="list-group" id="list">
              <a href="${feedLink || '#'}" class="list-group-item list-group-item-action active">
              ${feedName || 'Unknown feed'}</a>${items}</div>`;
  }

  validateInput(url) {
    const usedUrls = this.newsFeed.map(feed => feed.url);
    return (url.includes('localhost') || (validator.isURL(url) && !usedUrls.includes(url)));
  }

  isEqualsArticles = (first, second) =>
    (first.title === second.title && first.link === second.link && first.desc === second.desc)

  getNewArticles = (first, second) => _.differenceWith(first, second, this.isEqualsArticles);
}

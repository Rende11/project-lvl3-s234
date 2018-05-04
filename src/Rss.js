// @flow
import _ from 'lodash';
import axios from 'axios';
import validator from 'validator';
import $ from 'jquery';

import { getModal, getForm } from './templates';
import stateChanger from './utils';
import handlingDoc from './feedParser';

export default class Rss {
  constructor(element) {
    this.proxy = 'https://cors-anywhere.herokuapp.com';
    this.element = element;
    this.newsFeed = [];
  }


  handleOnSubmit = (e) => {
    e.preventDefault();
    const { linkInput } = _.fromPairs([...new FormData(e.target)]);
    const input = document.getElementById('link');

    if (!this.validateInput(linkInput)) {
      stateChanger.failed(input, 'Validation error - empty input, invalid or already used url');
    } else {
      stateChanger.success(input, 'Looks good - wait for download');
      axios.get(`${this.proxy}/${linkInput}`)
        .then((data) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.data, 'application/xml');
          const parsedNews = handlingDoc(doc);

          if (parsedNews.length === 0) {
            stateChanger.failed(input, "Can't parse news from this url");
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
        .catch((err) => {
          console.error(err);
          stateChanger.failed(input, 'Request failed');
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
          <button type="button" class="btn btn-outline-secondary" data-article-id="${el.id}" data-toggle="modal" data-target="#exampleModal">
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
}

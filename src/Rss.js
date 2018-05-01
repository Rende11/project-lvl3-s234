// @flow
import _ from 'lodash';
import validator from 'validator';

export default class Rss {
  constructor(element) {
    this.element = element;
    this.storage = [];
  }

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { linkInput } = _.fromPairs([...new FormData(e.target)]);
    const input = e.target.querySelector('#link');
    if (!this.validateInput(linkInput)) {
      input.classList.add('is-invalid');
    } else {
      input.classList.toggle('is-invalid');
      this.storage.push(linkInput);
      input.value = '';
      this.drawList();
    }
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
            Invalid or already used url
          </div>
        </div>
      </form>
    </div>`;

    const form = this.element.querySelector('form');

    form.addEventListener('submit', this.handleOnSubmit);
  }

  drawList() {
    if (this.storage.length > 0) {
      const items = this.storage.map(el => `<a href="#" class="list-group-item list-group-item-action">${el}</a>`).join('');
      const root = this.element.querySelector('#list');
      if (root) {
        root.innerHTML = items;
      } else {
        const rootNode = `
          <div class="list-group" id="list">
            ${items}
          </div>`;
        this.element.querySelector('#form').insertAdjacentHTML('beforeend', rootNode);
      }
    }
  }

  validateInput(url) {
    return validator.isURL(url) && !this.storage.includes(url);
  }
}

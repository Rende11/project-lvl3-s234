// @flow
import _ from 'lodash';

export default class Rss {
  constructor(element) {
    this.element = element;
    this.storage = [];
  }

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { linkInput } = _.fromPairs([...new FormData(e.target)]);
    this.storage.push(linkInput);
    const input = e.target.querySelector('#link');
    input.value = '';
    this.drawList();
  }

  init() {
    this.element.innerHTML =

    `<form>
      <div class="input-group mb-3">
        <input type="text" id="link" name="linkInput" required class="form-control" placeholder="rss link" aria-label="rss link" aria-describedby="basic-addon2">
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="submit">Go!</button>
        </div>
      </div>
    </form>`;

    const form = this.element.querySelector('form');

    form.addEventListener('submit', this.handleOnSubmit);
  }

  drawList() {
    console.log(this.storage);
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
        this.element.querySelector('form').insertAdjacentHTML('beforeend', rootNode);
      }
    }
  }
}

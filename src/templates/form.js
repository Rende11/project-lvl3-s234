export default () => {
  return `<div id="form">
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
}
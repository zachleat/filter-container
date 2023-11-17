class FilterContainer extends HTMLElement {
  static attrs = {
    oninit: "oninit",
    valueDelimiter: "delimiter",
    leaveUrlAlone: "leave-url-alone",
    mode: "filter-mode",
    bind: "data-filter-key",
    results: "data-filter-results",
    resultsExclude: "data-filter-results-exclude",
  };

  static register(tagName) {
    if("customElements" in window) {
      customElements.define(tagName || "filter-container", FilterContainer);
    }
  }

  getCss(keys) {
    return `${keys.map(key => `.filter-${key}--hide`).join(", ")} {
  display: none;
}`;
  }

  connectedCallback() {
    this._lookedFor = {};

    this.bindEvents(this.formElements);

    // even if this isn’t supported, folks can still add the CSS manually.
    if(("replaceSync" in CSSStyleSheet.prototype) && !this._cssAdded) {
      let sheet = new CSSStyleSheet();
      let css = this.getCss(Object.keys(this.formElements));
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      this._cssAdded = true;
    }

    if(this.hasAttribute(FilterContainer.attrs.oninit)) {
      // This timeout was necessary to fix a bug with Google Chrome 93
      // Navigate to a filterable page, navigate away, use the back button to return
      // (connectedCallback would filter before the DOM was ready)
      window.setTimeout(() => {
        for(let key in this.formElements) {
          this.initFormElements(this.formElements[key]);
          this.applyFilterForKey(key);
          this.renderResultCount(true);
        }
      }, 0);
    }
  }

  get valueDelimiter() {
    if(!this._valueDelimiter) {
      this._valueDelimiter = this.getAttribute(FilterContainer.attrs.valueDelimiter) || ",";
    }

    return this._valueDelimiter;
  }

  get formElements() {
    if(!this._lookedFor.formElements) {
      let selector = `:scope [${FilterContainer.attrs.bind}]`;
      let results = {};
      for(let node of this.querySelectorAll(selector)) {
        let attr = node.getAttribute(FilterContainer.attrs.bind);
        if(!results[attr]) {
          results[attr] = [];
        }
        results[attr].push(node);
      }
      this._formElements = results;
      this._lookedFor.formElements = true;
    }

    return this._formElements;
  }

  getAllKeys() {
    return Object.keys(this.formElements);
  }

  getElementSelector(key) {
    return `data-filter-${key}`
  }

  getKeyFromAttributeName(attributeName) {
    return attributeName.substr("data-filter-".length);
  }

  getFilterMode(key) {
    if(!this.modes) {
      this.modes = {};
    }
    if(!this.modes[key]) {
      this.modes[key] = this.getAttribute(`${FilterContainer.attrs.mode}-${key}`);
    }
    if(!this.modes[key]) {
      if(!this.globalMode) {
        this.globalMode = this.getAttribute(FilterContainer.attrs.mode);
      }
      return this.globalMode;
    }

    return this.modes[key];
  }

  bindEvents() {
    this.addEventListener("input", e => {
      let closest = e.target.closest(`[${FilterContainer.attrs.bind}]`);
      if(closest) {
        this.applyFilterForElement(closest);
        requestAnimationFrame(() => {
          this.renderResultCount();
        });
      }
    }, false);
  }

  initFormElements(formElements) {
    for(let el of formElements) {
      let urlParamValues = this.getUrlFilterValues(el);
      for(let value of urlParamValues) {
        let type = el.getAttribute("type");
        if(el.tagName === "INPUT" && (type === "checkbox" || type === "radio")) {
          if(el.value === value) {
            el.checked = true;
          }
        } else {
          el.value = value;
        }
      }
    }
  }

  getFormElementKey(formElement) {
    return formElement.getAttribute(FilterContainer.attrs.bind);
  }

  _getMap(key) {
    let values = [];
    for(let formElement of this.formElements[key]) {
      let type = formElement.getAttribute("type");
      if(formElement.tagName === "INPUT" && (type === "checkbox" || type === "radio")) {
        if(formElement.checked) {
          values.push(formElement.value);
        }
      } else {
        values.push(formElement.value);
      }
    }

    if(!this.hasAttribute(FilterContainer.attrs.leaveUrlAlone)) {
      this.updateUrl(key, values);
    }

    let elementsSelectorAttr = this.getElementSelector(key);
    let selector = `:scope [${elementsSelectorAttr}]`;
    let elements = this.querySelectorAll(selector);

    let map = new Map();
    for(let element of Array.from(elements)) {
      let isValid = this.elementIsValid(element, elementsSelectorAttr, values);
      map.set(element, isValid)
    }
    return map;
  }

  _applyMapForKey(key, map) {
    if(!key) {
      return;
    }

    for(let [element, isVisible] of map) {
      let cls = `filter-${key}--hide`;
      if(isVisible) {
        element.classList.remove(cls);
      } else {
        element.classList.add(cls);
      }
    }
  }

  applyFilterForElement(formElement) {
    let key = this.getFormElementKey(formElement);
    this.applyFilterForKey(key);
  }

  applyFilterForKey(key) {
    let firstFormElementForDelimiter = this.formElements[key][0];
    if(!firstFormElementForDelimiter) {
      return;
    }
    let map = this._getMap(key);
    this._applyMapForKey(key, map);
  }

  _hasValue(needle, haystack = [], mode = "any") {
    if(!haystack || !haystack.length || !Array.isArray(haystack)) {
      return false;
    }

    if(!Array.isArray(needle)) {
      needle = [needle];
    }

    // all must match
    if(mode === "all") {
      let found = true;
      for(let lookingFor of haystack) {
        if(!needle.some((val) => val === lookingFor)) {
          found = false;
        }
      }
      return found;
    }

    for(let lookingFor of needle) {
      // has any, return true
      if(haystack.some((val) => val === lookingFor)) {
        return true;
      }
    }
    return false;
  }

  elementIsValid(element, attributeName, values) {
    let hasAttr = element.hasAttribute(attributeName);
    if(hasAttr && (!values.length || !values.join(""))) { // [] or [''] for value="" radio
      return true;
    }
    let haystack = (element.getAttribute(attributeName) || "").split(this.valueDelimiter);
    let key = this.getKeyFromAttributeName(attributeName);
    let mode = this.getFilterMode(key);
    if(hasAttr && this._hasValue(haystack, values, mode)) {
      return true;
    }
    return false;
  }

  /*
   * Feature: Result count
   */

  get resultsCounter() {
    if(!this._lookedFor.resultsCounter) {
      this._results = this.querySelector(`:scope [${FilterContainer.attrs.results}]`);
      this._lookedFor.resultsCounter = true;
    }

    return this._results;
  }

  getGlobalCount() {
    let keys = this.getAllKeys();
    let selector = keys.map(key => {
      return `:scope [${this.getElementSelector(key)}]`;
    }).join(",");
    let elements = this.querySelectorAll(selector);

    return Array.from(elements)
      .filter(entry => this.elementIsVisible(entry))
      .filter(entry => !this.elementIsExcluded(entry))
      .length;
  }

  elementIsVisible(element) {
    for(let cls of element.classList) {
      if(cls.startsWith("filter-") && cls.endsWith("--hide")) {
        return false;
      }
    }
    return true;
  }

  elementIsExcluded(element) {
    return element.hasAttribute(FilterContainer.attrs.resultsExclude);
  }

  getLabels() {
    if(this.resultsCounter) {
      let attrValue = this.resultsCounter.getAttribute(FilterContainer.attrs.results);
      let split = attrValue.split("/");
      if(split.length === 2) {
        return split;
      }
    }
    return ["Result", "Results"];
  }

  _renderResultCount(count) {
    if(!this.resultsCounter) {
      return;
    }
    if(!count) {
      count = this.getGlobalCount();
    }

    let labels = this.getLabels();
    this.resultsCounter.innerText = `${count} ${count !== 1 ? labels[1] : labels[0]}`;
  }

  renderResultCount(isOnload = false) {
    if(!this.resultsCounter) {
      return;
    }

    if(!isOnload && this.resultsCounter.hasAttribute("aria-live")) {
      // This timeout helped VoiceOver
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this._renderResultCount()
      }, 250);
    } else {
      this._renderResultCount();
    }
  }

  /*
   * Feature: Work with URLs
   */

  getUrlSearchValue() {
    let s = window.location.search;
    if(s.startsWith("?")) {
      return s.substr(1);
    }
    return s;
  }

  getUrlFilterValues(formElement) {
    let params = new URLSearchParams(this.getUrlSearchValue());
    let key = this.getFormElementKey(formElement);
    return params.getAll(key);
  }

  // Future improvement: url updates currently once per key (we could group these into one)
  updateUrl(key, values) {
    let params = new URLSearchParams(this.getUrlSearchValue());
    let keyParamsStr = params.getAll(key).sort().join(",");
    let valuesStr = values.slice().sort().join(",");

    if(keyParamsStr !== valuesStr) {
      params.delete(key);
      for(let value of values) {
        if(value) { // ignore ""
          params.append(key, value);
        }
      }

      let baseUrl = window.location.pathname;
      history.replaceState({}, '', `${baseUrl}${params.toString().length > 0 ? `?${params}`: ""}` );
    }
  }
}

FilterContainer.register();
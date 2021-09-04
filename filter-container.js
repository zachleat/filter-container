class FilterContainer extends HTMLElement {
  constructor() {
    super();
    this.attrs = {
      bind: "data-filter-bind",
      oninit: "data-oninit",
      delimiter: "data-filter-delimiter",
      results: "data-filter-results",
      resultsExclude: "data-filter-results-exclude",
      skipUrlUpdate: "data-filter-skip-url",
    };
    this.classes = {
      enhanced: "filter-container--js",
      hidden: "filter--hide",
    }
  }

  connectedCallback() {
    this.classList.add(this.classes.enhanced);

    this.results = this.querySelector(`[${this.attrs.results}]`);
    let formElements = this.getAllFormElements();
    this.bindEvents(formElements);

    if(this.hasAttribute(this.attrs.oninit)) {
      this.filterAll(formElements, true);
    }
  }
  
  getAllFormElements() {
    return this.querySelectorAll(`[${this.attrs.bind}]`);
  }

  getAllKeys() {
    let keys = new Set();
    for(let formEl of this.getAllFormElements()) {
      keys.add(formEl.getAttribute(this.attrs.bind));
    }
    return Array.from(keys);
  }
  
  getElementSelector(key) {
    return `data-filter-${key}`
  }

  getAllFilterableElements() {
    let keys = this.getAllKeys();
    let selector = keys.map(key => {
      return `[${this.getElementSelector(key)}]`;
    }).join(",");
    return this.querySelectorAll(selector);
  }

  bindEvents(formElements) {
    for(let el of formElements) {
      el.addEventListener("change", e => {
        this.filter(e.target);
        requestAnimationFrame(() => {
          this.renderResultCount();
        })
      }, false);
    }
  }

  filterAll(formElements, isOnload = false) {
    for(let el of formElements) {
      if(isOnload) {
        let urlParamValue = this.getCurrentUrlFilterValue(el);
        if(urlParamValue) {
          el.value = urlParamValue;
        }
      }

      this.filter(el);
    }
    this.renderResultCount();
  }

  getSearchValue() {
    if(window.location.search.startsWith("?")) {
      return window.location.search.substr(1);
    }
    return window.location.search;
  }

  getCurrentUrlFilterValue(formElement) {
    let params = new URLSearchParams(this.getSearchValue());
    return params.get(this.getKey(formElement));
  }

  updateUrl(key, value) {
    if(!this.baseUrl) {
      this.baseUrl = window.location.pathname;
    }

    let params = new URLSearchParams(this.getSearchValue());
    if(params.get(key) !== value) {
      if(!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      history.pushState({}, '', `${this.baseUrl}${params.toString().length > 0 ? `?${params}`: ""}` );
    }
  }

  getKey(formElement) {
    return formElement.getAttribute(this.attrs.bind);
  }

  filter(formElement) {
    let key = this.getKey(formElement);
    let delimiter = formElement.getAttribute(this.attrs.delimiter);

    let value = formElement.value;

    if(!formElement.hasAttribute(this.attrs.skipUrlUpdate)) {
      this.updateUrl(key, value);
    }

    let elementsSelectorAttr = this.getElementSelector(key);
    let elements = this.querySelectorAll(`[${elementsSelectorAttr}]`);
    let cls = `filter-${key}--hide`;

    for(let element of Array.from(elements)) {
      if(this.elementIsValid(element, elementsSelectorAttr, value, delimiter)) {
        element.classList.remove(cls);
      } else {
        element.classList.add(cls);
      }
    }
  }

  elementIsValid(element, attributeName, value, delimiter) {
    if(!value && element.hasAttribute(attributeName)) {
      return true;
    }
    let attrValue = element.getAttribute(attributeName);
    if(delimiter && attrValue.split(delimiter).indexOf(value) > -1) {
      return true;
    }
    if(!delimiter && attrValue === value) {
      return true;
    }
    return false;
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
    return element.hasAttribute(this.attrs.resultsExclude);
  }

  getLabels() {
    if(this.results) {
      let attrValue = this.results.getAttribute(this.attrs.results);
      let split = attrValue.split("/");
      if(split.length === 2) {
        return split;
      }
    }
    return ["Result", "Results"];
  }

  renderResultCount() {
    if(!this.results) {
      return;
    }

    let fn = () => {
      let count = Array.from(this.getAllFilterableElements())
      .filter(entry => this.elementIsVisible(entry))
      .filter(entry => !this.elementIsExcluded(entry))
        .length;

      let labels = this.getLabels();
      this.results.innerHTML = `${count} ${count !== 1 ? labels[1] : labels[0]}`;
    };

    if(this.results.hasAttribute("aria-live")) {
      // This timeout helped VoiceOver
      clearTimeout(this.timeout);
      this.timeout = setTimeout(fn, 250);
    } else {
      fn();
    }
  }
}

if("customElements" in window) {
  window.customElements.define("filter-container", FilterContainer);
}
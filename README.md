# Filter Container

A themeless zero-dependency web component to filter visible child elements based on form field values.

* [Demo](https://zachleat.github.io/filter-container/demo.html)
* [Demo on jamstack.org](https://jamstack.org/generators/) (Filter by Language, Template, or License)
* [Demo on zachleat.com](https://www.zachleat.com/web/) (Filter by blog post category)

## Installation

```
npm install @zachleat/filter-container
```

Please see the demo for sample code. Use:

* `<filter-container>`
  * `<select data-filter-key="KEY_NAME">` for the form element and `<option value="CATEGORY_VALUE">` for categories.
  * (New in v3) `<input value="CATEGORY_VALUE" data-filter-key="KEY_NAME">` (try text, radio, checkbox, etc)
* Add a `data-filter-KEY_NAME="CATEGORY_VALUE"` attribute to _any_ child element of `<filter-container>` to assign both a filter key and category to match on.

### Optional Features

* You can add the CSS for each `KEY_NAME` yourself if you’re server rendering (or not happy with the [browser support of `replaceSync`](https://caniuse.com/mdn-api_cssstylesheet_replacesync)). Prepopulate the server-rendered content on each individual item using this too if you’d like (maybe your page has a server-rendered filter applied).

```css
.filter-KEY_NAME--hide {
  display: none;
}
```

* This component will not filter on initialization unless you use `<filter-container oninit>`. By default the form field needs to change for filtering to take place.
* Add the `data-filter-results` attribute to any child element of the component if you’d like us to populate it with the number of results.
  * Add a string to this attribute value to customize your Results labels (delimited by `/`). e.g. `data-filter-results="Country/Countries"`
  * Add `aria-live="polite"` to this element and screen readers will announce when the text changes.
* Use `<filter-container delimiter=",">` if your content elements may have more than one filter value assigned (in this example delimited by a comma).
  * For example, Egypt is in both Africa and Asia: `<li data-filter-continent="africa,asia">Egypt</li>`

## Changelog

### v3.0.4

- Add support for `filter-mode="all"` on `<filter-container>` to enable AND-ing filters for all multi-select form elements (checkboxes). Use `filter-mode-KEY_NAME="any"` to override back to the default.

### v3.0.3

- Add support for AND-ing filters across multiple checkboxes. Previously only OR operations were supported.
  - Use `filter-mode-KEY_NAME="all"` on `<filter-container>` to enable.

### v3.0.0

- Added support for radio and checkbox inputs for filtering.
- Renamed attributes:
  - `data-oninit` renamed to `oninit`
  - `data-filter-delimiter` renamed to `delimiter` (only supported on `<filter-container>`)
  - `data-filter-skip-url` renamed to `leave-url-alone` (only supported on `<filter-container>`)

## Credits

* [MIT](./LICENSE)
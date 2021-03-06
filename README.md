# Filter Container

A themeless web component to filter visible child elements based on form field values.

* [Demo](https://zachleat.github.io/filter-container/demo.html)
* [Demo on jamstack.org](https://jamstack.org/generators/) (Filter by Language, Template, or License)
* [Demo on zachleat.com](https://www.zachleat.com/web/) (Filter by blog post category)

## Installation

```
npm install @zachleat/filter-container
```

Please see the demo for sample code. Use:

* `<filter-container>`
* `<select data-filter-bind="KEY_NAME">` for the filter element.
* `<option value="ENTRY_VALUE">` for every filter category.
* Add a `data-filter-KEY_NAME="ENTRY_VALUE"` attribute to any child element to assign both a filter key and category to match on.
* Make sure to add the CSS for each `KEY_NAME`. You can prepopulate the server-rendered content using this too if you’d like (maybe your page has a server-rendered filter applied).

```css
.filter-KEY_NAME--hide {
  display: none;
}
```

### Optional Features

* This component will not filter on initialization unless you use `<filter-container data-oninit>`. By default the form field needs to change for filtering to take place.
* Add the `data-filter-results` attribute to any child element of the component if you’d like us to populate it with the number of results.
  * Add a string to this attribute value to customize your Results labels (delimited by `/`). e.g. `data-filter-results="Country/Countries"`
  * Add `aria-live="polite"` to this element and screen readers will announce when the text changes.
* Use `<select data-filter-delimiter=",">` if your content elements may have more than one filter value assigned (in this example delimited by a comma).
  * For example, Egypt is in both Africa and Asia: `<li data-filter-continent="africa,asia">Egypt</li>`

## Credits

* [MIT](./LICENSE)
# Filter Container

A themeless web component to filter visible child elements based on form field values.

* [Demo](https://zachleat.github.io/filter-container/demo.html)
* [Demo on jamstack.org](https://jamstack.org/generators/) (Filter by Language, Template, or License)

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
.filter-continent--KEY_NAME {
  display: none;
}
```

* Important: This component does not filter on initialization. The form field needs to change for filtering to take place.

### Optional Features

* Add the `data-filter-results` attribute to any child element of the component if you’d like us to populate it with the number of results.
* Use `<select data-filter-delimiter=",">` if your content elements may have more than one filter value assigned (in this example delimited by a comma).
  * For example, Egypt is in both Africa and Asia: `<li data-filter-continent="africa,asia">Egypt</li>`

## TODO

* Option to Internationalize `1 Result` `2 Results` strings

## Credits

* [MIT](./LICENSE)
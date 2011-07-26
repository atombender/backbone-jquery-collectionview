Collection view for Backbone and JQuery
=======================================

`Backbone.JQuery.CollectionView` is a generic, reusable view implementation which provides automatic creation of item views, as well as rudimentary reordering using mouse dragging, similar to JQuery's `Sortable`. Currently only vertical dragging is supported.

Usage
-----

There are some examples in the `examples` directory. Basically:

* Subclass the collection view and override the `createSubview()` method to return a view that corresponds to each model in the collection.
* Instantiate the collection view with a hash of options.
* Call `render()` on the view.

When instantiating the collection view, the following option is required:

* `collection`: This must be the collection that the view will be backed by.

Optional options:

* `dragTolerance`: The number of pixels that the mouse must be moved before the view interprets the action as a dragging movement.
* `scrollTolerance`: The number of pixels that the mouse must be within the edge of the window in order to trigger scrolling when dragging.
* `draggingClass`: Class name to add to item views when dragging. Defaults to `dragging`.
* `positionAttribute`: Name of attribute that has the ordinal position of each item. If this is specified, this attribute is maintained, and it is assumed that the collection has a similar comparator that uses the attribute. Otherwise, it is assumed that the collection is not automatically sorted, and dragging items in the view will simply rearrange the collection's contents.
* `dragConstrainX`: If true, dragging will be constrained to the Y axis only.
* `showPlaceholder`: If true, while dragging, leave a blank area where the dragged item was. Defaults to true.

Requirements
------------

* Backbone: http://documentcloud.github.com/backbone/
* Underscore: http://documentcloud.github.com/underscore/
* JQuery: http://jquery.com/

License
-------

The code uses the MIT license. See the file `LICENSE`.

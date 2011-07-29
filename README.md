Collection view for Backbone and JQuery
=======================================

This library provides a generic, reusable view which provides:

* Automatic management of item views
* Reordering using mouse dragging

Currently only vertical dragging is supported. Future plans include horizontal and hierarchical dragging and HTML5 drag/drop.

Usage
-----

There are some examples in the `examples` directory. Basically:

* Subclass `Backbone.JQuery.CollectionView` and override the `createSubview()` method to return a view that corresponds to each model in the collection.
* Instantiate the collection view with a hash of options.
* Call `render()` on the view.
* Provide CSS for dragging and dropping.

When instantiating the collection view, the following option is required:

* `collection`: This must be the collection that the view will be backed by.

Optional options:

* `dragging`: Set whether to enable drag and drop. Defaults to true.
* `dragTolerance`: The number of pixels that the mouse must be moved before the view interprets the action as a dragging movement.
* `scrollTolerance`: The number of pixels that the mouse must be within the edge of the window in order to trigger scrolling when dragging.
* `draggingClass`: Class name to add to item views when dragging. Defaults to `dragging`.
* `dropMarkerClass`: Class name to add to drop marker element that indicates where an item will be placed. Defaults to `drop_marker`.
* `positionAttribute`: Name of attribute that has the ordinal position of each item. If this is specified, this attribute is maintained, and it is assumed that the collection has a similar comparator that uses the attribute. Otherwise, it is assumed that the collection is not automatically sorted, and dragging items in the view will simply rearrange the collection's contents.
* `dragConstrainX`: If true, dragging will be constrained to the Y axis only.
* `showPlaceholder`: If true, while dragging, leave a blank area where the dragged item was. Defaults to true.

There are two CSS aspects that might need to be provided:

* The drag class. (Specified with the `draggingClass` option.) This class is added to the item view's element when it is being dragged.
* The drop marker class. (Specified with `dropMarkerClass` option.) When dragging an item, an indicator element is placed that highlights where the item will be dropped.

Requirements
------------

* Backbone: http://documentcloud.github.com/backbone/
* Underscore: http://documentcloud.github.com/underscore/
* JQuery: http://jquery.com/

License
-------

The code uses the MIT license. See the file `LICENSE`.

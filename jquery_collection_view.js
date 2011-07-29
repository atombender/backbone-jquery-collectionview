if (typeof Backbone.JQuery == 'undefined') {
  Backbone.JQuery = {};
}
Backbone.JQuery.CollectionView = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, 'render', '_renderOnReorder', '_setupSubviewElement', '_remove', '_add', '_reset');

    options = options || {};
    this.dragging = typeof options.dragging != 'undefined' ? options.dragging : true;
    this.dragTolerance = options.dragTolerance || 10;
    this.scrollTolerance = options.scrollTolerance || 40;
    this.draggingClass = options.draggingClass || 'dragging';
    this.positionAttribute = options.positionAttribute;
    this.dragConstrainX = options.dragConstrainX || false;
    this.showPlaceholder = typeof options.showPlaceholder != 'undefined' ? options.showPlaceholder : true;
    this.dropMarkerClass = options.dropMarkerClass || 'drop_marker';

    this._subviews = [];
    this._dragState = null;

    this.collection.bind('add', this._add);
    this.collection.bind('remove', this._remove);
    this.collection.bind('reset', this._reset);

    var self = this;
    this.collection.each(function(model) {
      self._add(model);
    });

    $(document.documentElement).bind('mousemove', function(event) {
      self._handleMouseMove(event);
      event.stopPropagation();      
    });
    $(document.documentElement).bind('mouseup', function(event) {
      self._endDrag();
      event.stopPropagation();
    });
  },

  createSubview: function(model) {
    throw "Not implemented";
  },

  _setupSubviewElement: function(view) {
    var el = view.render().el;
    el.unselectable = 'on';
    el.draggable = false;
    $(el).bind('mousedown selectstart', function(event) {
      event.preventDefault();
    });

    var self = this;
    $(el).mousedown(function(event) {
      self._beginDrag(event, view);
      event.stopPropagation();
    });
    return el;
  },

  _add: function(model) {
    var view = this.createSubview(model);
    this._subviews.push(view);

    // FIXME: This is a lazy way of reordering, we could place it in the right spot right away
    if (this._rendered) {
      $(this.el).append(this._setupSubviewElement(view));
      this._renderOnReorder();
    }
  },

  _remove: function(model) {
    var view = _(this._subviews).select(function(v) { return v.model === model; })[0];
    if (view) {
      this._subviews = _(this._subviews).without(view);
      if (this._rendered) {
        $(view.el).remove();
      }
    }
  },

  _reset: function() {
    this.render();
  },
  
  render: function() {
    this._rendered = true;

    this._endDrag();

    this._subviews.length = 0;
    $(this.el).empty();

    var self = this;
    this.collection.each(function(model) {
      var view = self.createSubview(model);
      self._subviews.push(view);
      $(self.el).append(self._setupSubviewElement(view));
    });

    return this;
  },

  _renderOnReorder: function() {
    var self = this;

    // FIXME: This is inefficient, we could also just diff and reorganize the DOM nodes
    this._subviews = _.sortBy(this._subviews, function(view) {
      return self.collection.indexOf(view.model);
    });
    _.each(this._subviews, function(view) {
      if (view.el) {
        $(view.el).detach();
      }
    })
    _.each(this._subviews, function(view) {
      $(self.el).append(view.el);
    })
  },

  _mayDrag: function() {
    return this.dragging && this._subviews.length > 1;
  },

  _beginDrag: function(event, view) {
    if (!this._dragState) {
      if (!this._mayDrag()) {
        return;
      }
      this._draggingView = view;
      this._dragStartX = $(view.el).offset().left - $(document).scrollLeft();
      this._dragStartY = $(view.el).offset().top - $(document).scrollTop();
      this._dragAnchorX = this._dragStartX - event.clientX;
      this._dragAnchorY = this._dragStartY - event.clientY;
      this._dragSibling = view.el.nextSibling;
      if (this.dragTolerance > 0) {
        this._dragState = 'tolerating';
      } else {
        this._dragState = 'dragging';
        this._handleMouseMove(event);
      }
    }
  },

  _handleMouseMove: function(event) {
    if (this._dragState) {
      var view = this._draggingView;

      if (this._dragState == 'tolerating') {
        if (Math.abs(event.pageX + this._dragAnchorX - this._dragStartX - $(document).scrollLeft()) > this.dragTolerance ||
          Math.abs(event.pageY + this._dragAnchorY - this._dragStartY - $(document).scrollTop()) > this.dragTolerance) {
          this._dragState = 'dragging';
          
          this._placeholderWidth = $(view.el).outerWidth();
          this._placeholderElement =
            $("<" + view.el.tagName + "></" + view.el.tagName + ">").
            css('width', this._placeholderWidth + 'px').
            css('height', $(view.el).outerHeight() + 'px').
            insertBefore(view.el);
          this._placeholderOffset = $(this._placeholderElement).offset();
          if (!this.showPlaceholder) {
            $(this._placeholderElement).slideUp('fast');
          }

          $(view.el).css('width', $(view.el).width() + 'px');
          $(view.el).css('height', $(view.el).height() + 'px');
          $(view.el).css('position', 'absolute');
          $(view.el).css('zIndex', '65535');
          $(view.el).addClass(this.draggingClass);

          $(view.el).detach();
          $(view.el).appendTo($(document.body));
        }
      }

      if (this._dragState == 'dragging') {
        var scrollTop = $(document).scrollTop();
        if (event.pageY < scrollTop + this.scrollTolerance) {
          $(document).scrollTop(scrollTop - this.scrollTolerance);
        } else if (event.pageY - scrollTop > window.innerHeight - this.scrollTolerance) {
          $(document).scrollTop(scrollTop + this.scrollTolerance);
        }

        if (this.dragConstrainX) {
          $(view.el).css('left', this._placeholderOffset.left + 'px');
        } else {
          $(view.el).css('left', (event.pageX + this._dragAnchorX) + 'px');
        }
        $(view.el).css('top', (event.pageY + this._dragAnchorY) + 'px');
        
        var previousView;
        if (this._subviews.indexOf(view) > 0) {
          previousView = this._subviews[this._subviews.indexOf(view) - 1];
        }
        this._dropTargetView = this;
        for (var i = 0; i < this._subviews.length; i++) {
          var targetView = this._subviews[i];
          if (targetView != view && event.pageY + this._dragAnchorY >= $(targetView.el).offset().top) {
            this._dropTargetView = targetView;
          }
        }
        
        if (this._dropTargetView != view && (!this.showPlaceholder || this._dropTargetView != previousView)) {
          if (!this._dropMarkerElement) {
            this._dropMarkerElement = $('<div></div>').
              addClass(this.dropMarkerClass).
              css('position', 'absolute').
              css('left', this._placeholderOffset.left + 'px').
              css('width', this._placeholderWidth + 'px');
            $(document.documentElement).append(this._dropMarkerElement);
          }
          if (this._dropTargetView == this) {
            $(this._dropMarkerElement).
              css('top', $(this._subviews[view == this._subviews[0] ? 1 : 0].el).offset().top);
          } else {
            $(this._dropMarkerElement).
              css('top',
                $(this._dropTargetView.el).offset().top + 
                $(this._dropTargetView.el).outerHeight());
          }
        } else {
          if (this._dropMarkerElement) {
            this._dropMarkerElement.remove();
            this._dropMarkerElement = null;
          }
        }
      }
    }
  },

  _endDrag: function() {
    if (this._dragState) {
      var view = this._draggingView;
      if (this._dropMarkerElement) {
        this._dropMarkerElement.remove();
        this._dropMarkerElement = null;
      }
      if (this._placeholderElement) {
        this._placeholderElement.detach();
        this._placeholderElement = null;
      }
      if (this._dragState == 'dragging') {
        this._doDrop();
      }
      this._dragState = null;
    }
  },

  _doDrop: function() {
    var view = this._draggingView;
    this._draggingView = null;

    $(view.el).removeClass(this.draggingClass);
    $(view.el).detach();

    if (this._dragSibling) {
      $(view.el).insertBefore(this._dragSibling);
    } else {
      $(view.el).appendTo(this.el);
    }

    $(view.el).
      css('width', '').
      css('height', '').
      css('position', '').
      css('zIndex', '').
      css('left', '').
      css('top', '');

    if (this._dropTargetView) {
      if (this.positionAttribute) {
        var oldPosition = view.model.get(this.positionAttribute);
        var newPosition;
        if (this._dropTargetView == this) {
          newPosition = this._subviews[0].model.get(this.positionAttribute);
        } else {
          newPosition = this._dropTargetView.model.get(this.positionAttribute) + 1;
          if (newPosition > oldPosition) {
            newPosition -= 1;
          }
        }
        if (newPosition != oldPosition) {
          var models = this.collection.toArray();
          for (var i = 0; i < models.length; i++) {
            var item = models[i];
            if (newPosition > oldPosition) {
              if (item.get(this.positionAttribute) > oldPosition && item.get(this.positionAttribute) <= newPosition) {
                item.set({position: item.get(this.positionAttribute) - 1});
              }
            } else {
              if (item.get(this.positionAttribute) < oldPosition && item.get(this.positionAttribute) >= newPosition) {
                item.set({position: item.get(this.positionAttribute) + 1});
              }        
            }
          }
          view.model.set({position: newPosition});
          this.collection.sort({silent: true});
          this._renderOnReorder();
        }
      } else {
        var oldPosition = this.collection.indexOf(view.model);
        var newPosition;
        if (this._dropTargetView == this) {
          newPosition = 0;
        } else {
          newPosition = this.collection.indexOf(this._dropTargetView.model) + 1;
          if (newPosition > oldPosition) {
            newPosition -= 1;
          }
        }
        if (newPosition != oldPosition) {
          this.collection.remove(view.model, {silent: true});
          this.collection.add(view.model, {silent: true, at: newPosition});
          this._renderOnReorder();
        }
      }
    }
  }
});

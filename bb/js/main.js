console.profile();
window.Wine = Backbone.Model.extend({
	urlRoot: "api/index.json",
	
	defaults: {
		"id": null,
    "name":  "",
    "grapes":  "",
    "country":  "USA",
    "region":  "California",
    "year":  "",
    "description":  "",
    "picture":  ""
	}
});
l(window.Wine,'Wine');

window.WineCollection = Backbone.Collection.extend({
	model: Wine,
	url: "api/index.json"
});

l(window.WineCollection,'WineCollection');



/***************** Views ***************************/
window.WineListView = Backbone.View.extend({

	el: $('#wineList'),

  initialize: function() {
  	l(this,'WineListItemView initialize');
		this.model.bind("reset", this.render, this); 	
		this.model.bind("add", function(wine) {
			$('#wineList').append(new WineListItemView({model: wine}).render().el);
		});
  },

  render: function(eventName) {
  	l(this,'WineListItemView render');
		_.each( this.model.models, function(wine) {
	    $(this.el).append(new WineListItemView({model: wine}).render().el);
		}, this);
		
		return this;
	}
});




window.WineListItemView = Backbone.View.extend({

	tagName: "li",

	template: _.template($('#wine-list-item').html()),

    initialize: function() {
    	l(this,'WineListItemView initialize');
			this.model.bind("change", this.render, this);
			this.model.bind("destroy", this.close, this);
    },

    render: function(eventName) {
    	l(this,'WineListItemView render');
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
    },

	close: function() {
		l(this,'WineListItemView close');
		$(this.el).unbind();
		$(this.el).remove();
	}
});




window.WineView = Backbone.View.extend({

  el: $('#mainArea'),
	
	template: _.template($('#wine-details').html()),

  initialize: function() {
  	l(this,'WineView initialize');
		this.model.bind("change", this.render, this);
  },

  render: function(eventName) {
  	l(this,'WineView render');
		$(this.el).html( this.template(this.model.toJSON()) );
		return this;
  },

  events: {
    "change input": "change",
		"click .save": "saveWine",
		"click .delete": "deleteWine"
  },

  change: function(event) {
  	l(this,'WineView change');
		var target = event.target;
		console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
		// You could change your model on the spot, like this:
		// var change = {};
		// change[target.name] = target.value;
		// this.model.set(change);
  },

	saveWine: function() {
		l(this,'WineView saveWine');
		this.model.set({
			name: $('#name').val(),
			grapes: $('#grapes').val(),
			country: $('#country').val(),
			region: $('#region').val(),
			year: $('#year').val(),
			description: $('#description').val()
		});

		if (this.model.isNew()) {
			var self = this;
			app.wineList.create(this.model, {
				success: function() {
					l(this,'WineView saveWine:success');
					app.navigate('wines/'+self.model.id, false);
				}
			});
		} else {
			this.model.save();
		}
		
		return false;
	},
	
	deleteWine: function() {
		l(this,'WineView deleteWine');
		this.model.destroy({
			success: function() {
				alert('Wine deleted successfully');
				window.history.back();
			}
		});
		return false;
	},

	close: function() {
		l(this,'WineView close');
		$(this.el).unbind();
		$(this.el).empty();
	}
});

window.HeaderView = Backbone.View.extend({

	el: $('.header'),
	
	template: _.template($('#header').html()),

  initialize: function() {
  	l(this,'HeaderView initialize');
		this.render();
  },

  render: function(eventName) {
  	l(this,'HeaderView render');
		$(this.el).html(this.template());
		return this;
  },

  events: {
		"click .new": "newWine"
  },

	newWine: function(event) {
		l(this,'HeaderView newWine');
		app.navigate("wines/new", true);
		return false;
	}
});

var AppRouter = Backbone.Router.extend({

	routes: {
		""			: "list",
		"wines/new"	: "newWine",
		"wines/:id"	: "wineDetails"
	},

	list: function() {
		l(this,'AppRouter list');
    this.wineList = new WineCollection();
		var self = this;
		this.wineList.fetch({
			success: function() {
				l(this,'AppRouter list:success');
		    self.wineListView = new WineListView( {model: self.wineList} );
				self.wineListView.render();
				if (self.requestedId) self.wineDetails(self.requestedId);
			}
		});
  	},

	wineDetails: function(id) {
		l(this,'AppRouter wineDetails');
		if (this.wineList){
			this.wine = this.wineList.get(id);
			if (this.wineView) this.wineView.close();
		    		this.wineView = new WineView({model: this.wine});
			this.wineView.render();
		} else {
			this.requestedId = id;
			this.list();
		}
  },

	newWine: function() {
		l(this,'AppRouter newWine');
		if (app.wineView) app.wineView.close();
			app.wineView = new WineView({model: new Wine()});
		app.wineView.render();
	}

});

function l(val, msg){
	if(!val) return 'gtfo';
	else if( typeof(val)==='string' ) console.log('', msg ? val+' '+msg : val);
	else if(msg) console.log(val, msg);
	else 	console.log(val);
}

var app = new AppRouter();
Backbone.history.start();
var header = new HeaderView();

console.profileEnd();
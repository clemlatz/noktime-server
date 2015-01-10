var app = angular.module('noktime', ['ui.sortable', 'ngSanitize']);

/* MODELS */

var Task = function(name, id, order, created, completed, snoozed) {
	this.id = id;
	this.name = name;
	this.created = created || new Date();
	this.completed = completed || false;
	this.snoozed = snoozed || false;
};

/* FILTERS */

app.filter('fancy', function() {
	return function(input) {
		return input.replace(/(#\S*)/g, '<span class="label label-success">$1</span>')
			.replace(/(@\S*)/g, '<span class="label label-info">$1</span>');
  	};
});

/* CONTROLLERS */

app.controller('TabController', function() {
	this.selected = 'tasks';
});

app.controller('TaskController', function($scope) {

	var ctrl = this;

	this.newTask = new Task();

	// Create new task
	this.create = function() {
		$scope.tasks.push(this.newTask);
		log('Added task: '+this.newTask.name);
		this.newTask = new Task(); // reset new task placeholder
	};
	
	// Edit existing task
	this.edit = function(task) {
		var newName = prompt('New name ?', task.name);
		if (newName) {
			log('Task name changed from '+task.name+' to'+newName);
			task.name = newName;
		}
	};
	
	// Remove task from list
	this.remove = function(task) {
		var index = $scope.tasks.indexOf(task);
		$scope.tasks.splice(index, 1);
		log('Task '+task.name+' deleted');
	};
	
	// Save to localStorage
	this.save = function() {
		localStorage.tasks = angular.toJson($scope.tasks);
		log('Tasks saved to localStorage');
	};
	
	// Load from localStorage
	this.load = function() {
		if (localStorage.tasks) {
			log('Tasks loaded from localStorage');
			return JSON.parse(localStorage.tasks);
		}
		
		return [];
	};	
	
	// Load tasks on startup
	$scope.tasks = this.load();

	$scope.$watch('tasks', function(newVal, oldVal) {
		ctrl.save();
	}, true);
	
});

/* HELPERS */

function log(msg) {
	console.log(msg);
}

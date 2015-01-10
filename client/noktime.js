
/* MODELS */

var Task = function(name, id, order, created, completed, snoozed) {
	this.id = id;
	this.name = name;
	this.order = order || 0;
	this.created = created || new Date();
	this.completed = completed || false;
	this.snoozed = snoozed || false;
};

/* CONTROLLERS */

var app = angular.module('noktime', []);

app.controller('TabController', function() {
	this.selected = 'tasks';
});

app.controller('TaskController', function($scope) {

	var ctrl = this;

	this.newTask = new Task();

	this.create = function() {
		$scope.tasks.push(this.newTask);
		log('Added task: '+this.newTask.name);
		this.newTask = new Task(); // reset new task placeholder
	};
	
	// Remove task from list
	this.remove = function(task) {
		var index = $scope.tasks.indexOf(task)
		$scope.tasks.splice(index, 1);     
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

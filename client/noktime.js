	
	var TaskList = function(list) {
		this.list = [];
	};
	// 
	TaskList.prototype = {
		load: function() {
			
			var list = this.list;
			
			// Load tasks from localstorage
			$.each(nt.user_data.tasks, function(index, item) {
				var task = new Task(item.id, item.name, item.order, item.created, item.completed);
				list.push(task);
				$('#task-list').append(task.render());
			});
			
			// Hide completed tasks on startup
			$('.completed').hide();
		},
		
		add: function(task) {
			
			// Add to the task list object
			this.list.push(task);
			
			// Save to localstorage
			nt.saveData();
			
			// Append to the DOM to the DOM
			$('#task-list').append(task.render());
		},
		
		get: function(id) {
			var key = nt.getKeyFromId(this.list, id);
			return this.list[key];
		},
		
		update: function(task) {
			
			// Update in list
			var key = nt.getKeyFromId(this.list, task.id);
			this.list[key] = task;
			
			// Save to localstorage
			nt.saveData();
			
			// Update DOM
			$('#task_'+task.id).replaceWith(task.render());
		},
		
		delete: function(task) {
			
			// Update in list
			var key = nt.getKeyFromId(this.list, task.id);
			
			this.list.splice(key, 1);
			
			// Save to localstorage
			nt.saveData();
			
			// Update DOM
			$('#task_'+task.id).remove();			
		},
		
		filter: function(query) {
			
			$('.filtered').removeClass('filtered');
			
			if (query)
			{
				$.each(this.list, function(i, task) {
					
					if (task.name.toLowerCase().indexOf(query.toLowerCase()) < 0)
					{
						$('#task_'+task.id).addClass('filtered');
					}
					else
					{
						$('#task_'+task.id).removeClass('filtered');
					}
					
				});
			}
			else
			{
				$('#tasks').find('li').removeClass('filtered');
			}
			
		}
	};
	
	var Task = function(id, name, order, created, completed) {
		this.id = id || nt.makeUid();
		this.name = name;
		this.order = order || 0;
		this.created = created || new Date();
		this.completed = completed || 'false';
	};
	
	Task.prototype = {
		render: function() {
			
			// Is task completed ?
			var completed = (this.completed == 'false') ? '' : ' completed',
				checked = (this.completed == 'false') ? '' : ' checked';
			
			// #project and @client highlighting
			var label = this.name;
			if (label)
			{
				label = label.replace(/(#\S*)/g, '<span class="label label-success">$1</span>');
				label = label.replace(/(@\S*)/g, '<span class="label label-info">$1</span>');
			}
			
			var html = '<li id="task_'+this.id+'" data-id="'+this.id+'" class="list-group-item task'+completed+'" data-order='+this.order+' data-completed='+this.completed+'>' +
				'<input id="task_'+this.id+'_input" class="completeTask" type="checkbox"'+checked+'> ' +
				'<label for="task_'+this.id+'_input">'+ label + '</label>' +
				'<span class="pull-right btn-group pointer">' +
					'<button type="button" class="btn btn-default btn-sm editTask"><i class="fa fa-edit"></i> edit</button>' +
					'<button type="button" class="btn btn-default btn-sm addActivity"><i class="fa fa-clock-o"></i> time</button>' +
					'<button type="button" class="btn btn-default btn-sm deleteTask"><i class="fa fa-trash-o"></i> delete</button>' +
				'</span>' +
			'</li>';
			
			return html;
		}
	};
	
	var Activity = function(id, name, duration, task_id) {
		this.id = id || nt.makeUid();
		this.name = name;
		this.duration = duration;
		this.task_id = task_id;
		this.date = new Date();
	};
	
	Activity.prototype = {
		append: function() {
			
			// #project and @client highlighting
			var label = this.name;
			label = label.replace(/(#\S*)/g, '<span class="label label-success">$1</span>');
			label = label.replace(/(@\S*)/g, '<span class="label label-info">$1</span>');
			
			// Duration
			var hours = parseInt(Number(this.duration)),
			minutes = Math.round((Number(this.duration)-hours) * 60),
			duration = (hours < 10 ? '0' : '')+hours+':'+(minutes < 10 ? '0' : '')+minutes;
			
			var html = '<li id="activity_'+this.id+'" data-id="'+this.id+'" class="list-group-item activity">' +
			duration + '&mdash;' + label +
			'<span class="pull-right btn-group pointer">' +
				'<button type="button" class="btn btn-default btn-xs deleteActivity"><i class="fa fa-trash-o"></i> delete</button>' +
			'</span>' +
			'</li>';
			
			$("#activity-list").append(html);
			
		}
	};

	var nt = {
		
		app_version: '0.5.0',
		db_version: 1,
		
		user_id: null,
		user_data: {
			tasks: [],
			activities: []
		},
		
		tasks: new TaskList(),
		
		initialize: function() {
			
			// Show app version
			$(".app-version").html(nt.app_version);
			
			// Updated database if necessary
			if (nt.db_version != localStorage.db_version)
			{
				if (confirm('Database needs to be updated. You will loose all your data. Continue ?'))
				{
					localStorage.removeItem('user_data');
					localStorage.db_version = nt.db_version;
				}
				else throw new Error('Database is outdated. Please reload the page.');
			}
			
			// User UID
			if (localStorage.user_id) 
			{
				nt.user_id = localStorage.user_id;
				nt.loadData();
			} 
			else 
			{
				nt.user_id = nt.makeUid();
				localStorage.user_id = nt.user_id;
				nt.saveData();
			}
			
			// Load events
			nt.loadEvents();
			
			// Load default page at startup
			nt.loadPage('tasks');
			
		},
		
		loadEvents: function() {
			
			/* NAVIGATION */
		
			// Change page
			$('a').click( function(event) {
				var href = $(this).attr('href');
				if (href.indexOf('#/') != -1)
				{
					var page = href.replace('#/','');
					nt.loadPage(page);
				}
				else
				{
					if (navigator.onLine) window.location = href;
				}
			});
			
			/* TASKS */
			
			// Create new task
			$('#createTask').submit( function(event) {
				event.preventDefault();
				
				// Create new task object
				var task = new Task(0, $(this).find('input').val());
				
				// Add to the task list
				nt.tasks.add(task);
				
				// Clear input
				$(this).find('input').val('');
			});
			
			// Edit task
			$('#tasks').on('click', '.editTask', function() {
				
				// Get task & task new name
				var id = $(this).closest('li').data('id'),
					task = nt.tasks.get(id);
					newName = prompt('New task text ?', task.name);
				
				if (newName)
				{
					task.name = newName;
					nt.tasks.update(task);
				}
			});
			
			// Check task as completed
			$('#tasks').on('click', '.completeTask', function() {
				
				var task = nt.tasks.get($(this).closest('li').data('id'));
					
				if (task.completed == "false")
				{
					task.completed = new Date();
				}
				else
				{
					task.completed = "false";
				}
				nt.tasks.update(task);
			});
			
			// Delete task
			$('#tasks').on('click', '.deleteTask', function() {
				
				var task = nt.tasks.get($(this).closest('li').data('id'));
				
				nt.tasks.delete(task);
			});
			
			// Toggle completed tasks
			$('#toggleCompleted').on('click', function() {
				var el = $(this);
				if (el.data('toggled') == 1) {
					$('.completed').hide();
					el.data('toggled', 0);
				} else {
					$('.completed').show();
					el.data('toggled', 1);
				}
			});
			
			// Filter tasks
			$('#filterTasks').on('keyup', function() {
				
				nt.tasks.filter($(this).val());
				
			});
			
			/* ACTIVITY */
			
			// Add activity
			$('#tasks').on('click', '.addActivity', function() {
				
				var task = nt.tasks.get($(this).closest('li').data('id'));
				
				// Get duration
				var duration = prompt('Hours spent ?', 1);
				
				// Create duration task
				var activity = new Activity(0, task.name, duration, task.id);

				// Append to the DOM
				activity.append();

				// Save to local storage
				nt.user_data.activities.push(activity);
				nt.saveData();
				
			});
			
			// Delete activity
			$('#activity').on('click','.deleteActivity', function() {
				var id = $(this).parent().parent().data('id');
				$('#activity_'+id).slideUp('fast', function() { $(this).remove(); });
				for (var i = 0, c = nt.user_data.activities.length; i < c; i++) 
				{
					if (nt.user_data.activities[i].id == id) 
					{
						nt.user_data.activities.splice(i, 1);
						break;
					}
				}
				nt.saveData();
			});
			
		},
		
		// Generate Unique ID
		makeUid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		},
		
		// Save user data
		saveData: function() {
			nt.user_data.saved = new Date();
			nt.user_data.tasks = nt.tasks.list;
			localStorage.user_data = JSON.stringify(nt.user_data);
		},
		
		// Load user data & hydrate page
		loadData: function() {
			if (localStorage.user_data) {
				
				// Load data from localStorage
				nt.user_data = JSON.parse(localStorage.user_data);
				
				// Load and render tasklist
				nt.tasks.load();
				
				// Activities
				if (typeof nt.user_data.activities === 'undefined') 
				{
					nt.user_data.activities = []; // Added in 0.4
				}
				
				$.each(nt.user_data.activities, function(index, item) {
					var activity = new Activity(item.id, item.name, item.duration, item.task_id);
					activity.append();
				});
			}
		},
		
		// Load a page
		loadPage: function(page) {
			// Show page and hide others
			$('.page').hide();
			$('#'+page).show();
			
			// Activate tab and deactivate others
			$('.active').removeClass('active');
			$('#tab-'+page).addClass('active');
		},
		
		// Update a task
		updateTask: function(id, field, value)
		{
			var task = Task.getById(id);
			task.update();
		},
		
		// Get element in array by it's id
		getKeyFromId: function(array, id) {
			for (var i = 0, c = array.length; i < c; i++) 
			{
				if (array[i].id == id) 
				{
					return i;
				}
			}
			
			return false;
		},
		
		removeById: function(array, id) {
			for (var i = 0, c = array.length; i < c; i++) 
			{
				if (array[i].id == id) 
				{
					array.splice(i, 1);
					return true;
				}
				
				return false;
			}
		}
	};

	$(function() {

		nt.initialize();
		
		$(".sortable").sortable({
			update: function(event, ui) {
			
				// Update order
				var i = 1;
				$('.task').each( function() {
					var id = $(this).attr('data-id');
					nt.updateTask(id, 'order', i);
					$(this).attr('data-order', i);
					i++;
				});
				nt.user_data.tasks.sort(function(x, y) {
					if (x.order < y.order) return -1;
					if (x.order > y.order) return 1;
					return 0;
				});
				nt.saveData();
			}
		});
		
		
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

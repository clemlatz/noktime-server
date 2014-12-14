
	var Task = function(id, name, order, created, completed) {
		this.id = id || nt.makeUid();
		this.name = name;
		this.order = order || 0;
		this.created = created || new Date();
		this.completed = completed || 'false';
	}
	
	Task.prototype = {
		append: function() {
			
			// Is task completed ?
			var completed = (this.completed == 'false') ? '' : ' completed',
				checked = (this.completed == 'false') ? '' : ' checked'
			
			// #project and @client highlighting
			var label = this.name;
			label = label.replace(/(#\S*)/g, '<span class="label label-success">$1</span>');
			label = label.replace(/(@\S*)/g, '<span class="label label-info">$1</span>');
			
			var html = '<li id="task_'+this.id+'" data-id="'+this.id+'" class="list-group-item task'+completed+'" data-order='+this.order+' data-completed='+this.completed+'>' +
				'<input id="task_'+this.id+'_input" class="event" type="checkbox"'+checked+'> ' +
				'<label for="task_'+this.id+'_input">'+ label + '</label>' +
				'<span class="pull-right btn-group pointer">' +
					'<button type="button" class="btn btn-default btn-sm addActivity event"><i class="fa fa-clock-o"></i> time</button>' +
					'<button type="button" class="btn btn-default btn-sm deleteTask event"><i class="fa fa-trash-o"></i> delete</button>' +
				'</span>' +
			'</li>';
			$("#task-list").append(html);
		}
	}
	
	var Activity = function(id, name, duration, task_id) {
		this.id = id || nt.makeUid();
		this.name = name;
		this.duration = duration;
		this.task_id = task_id;
		this.date = new Date();
	}
	
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
				'<button type="button" class="btn btn-default btn-xs deleteActivity event"><i class="fa fa-trash-o"></i> delete</button>' +
			'</span>' +
			'</li>';
			
			$("#activity-list").append(html);
			
		}
	}

	var nt = {
		
		app_version: '0.4',
		db_version: 1,
		
		user_id: null,
		user_data: {
			tasks: [],
			activities: []
		},
		
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
				else throw new Error('Database is outdated. Please reload the page.')
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
				
				// Save to localstorage
				nt.user_data.tasks.push(task);
				nt.saveData();
				
				// Append to task list
				task.append();
				
				// Clear input
				$(this).find('input').val('');
			});
			
			// Delete task
			$('#tasks').on('click', '.deleteTask', function() {
				var id = $(this).parent().parent().data('id');
				$('#task_'+id).slideUp('fast', function() { $(this).remove(); });
				for (var i = 0, c = nt.user_data.tasks.length; i < c; i++) 
				{
					if (nt.user_data.tasks[i].id == id) 
					{
						nt.user_data.tasks.splice(i, 1);
						break;
					}
				}
				nt.saveData();
			});
			
			// Check task as completed
			$('#tasks').on('click', 'input[type=checkbox]', function() {
				var id = $(this).parent().attr('data-id'),
					completed = $(this).parent().attr('data-completed');
				if (completed == "false")
				{
					$(this).parent().addClass('completed').attr('data-completed', new Date());
					nt.updateTask(id, 'completed', new Date());
				}
				else
				{
					$(this).parent().removeClass('completed').attr('data-completed', 'false');
					nt.updateTask(id, 'completed', 'false');
				}
				nt.saveData();
			});
			
			/* ACTIVITY */
			
			// Add activity
			$('#tasks').on('click', '.addActivity', function() {
				
				// Get duration
				var duration = prompt('Hours spent ?', 1);
				
				// Create duration task
				var activity = new Activity(0, $(this).parent().parent().find('label').text(), duration, $(this).parent().parent().data('id'));

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
			localStorage.user_data = JSON.stringify(nt.user_data);
		},
		
		// Load user data & hydrate page
		loadData: function() {
			if (localStorage.user_data) {
				nt.user_data = JSON.parse(localStorage.user_data);
				if (typeof nt.user_data.activities === 'undefined') nt.user_data.activities = []; // Added in 0.4
				
				$.each(nt.user_data.tasks, function(index, item) {
					var task = new Task(item.id, item.name, item.order, item.created, item.completed);
					task.append();
				});
				
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
			for (var i = 0, c = nt.user_data.tasks.length; i < c; i++) 
			{
				if (nt.user_data.tasks[i].id == id) 
				{
					nt.user_data.tasks[i][field] = value;
					break;
				}
			}
		}
	}

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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

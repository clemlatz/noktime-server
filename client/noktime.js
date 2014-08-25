
	var nt = {
		
		appVersion: '0.2',
		
		user_id: null,
		user_data: {
			tasks: [],
			projects: [],
			clients: []
		},
		
		initialize: function() {
			
			// Show app version
			$(".app-version").html(nt.appVersion);
			
			// User UID
			if (localStorage.user_id) {
				nt.user_id = localStorage.user_id;
				nt.loadData();
			} else {
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
			$('#createTask.event').submit( function(event) {
				event.preventDefault();
				var task = {};
				task.id = nt.makeUid(),
				task.name = $(this).find('input').val();
				task.order = 0;
				task.created = new Date();
				task.completed = 'false';
				nt.user_data.tasks.push(task);
				nt.renderTask(task);
				nt.saveData();
				$(this).find('input').val('');
			}).removeClass('event');
			
			// Delete task
			$('.deleteTask.event').click( function() {
				var id = $(this).parent().data('id');
				$('#task_'+id).slideUp('fast', function() { $(this).remove(); });
				for (var i = 0, c = nt.user_data.tasks.length; i < c; i++) {
					if (nt.user_data.tasks[i].id == id) {
						nt.user_data.tasks.splice(i, 1);
						break;
					}
				}
				nt.saveData();
			}).removeClass('event');
			
			// Check task as completed
			$('.task input[type=checkbox].event').click( function() {
				var id = $(this).parent().attr('data-id'),
					completed = $(this).parent().attr('data-completed');
				console.log('completed');
				if (completed == "false")
				{
					console.log('plop1');
					$(this).parent().addClass('completed').attr('data-completed', new Date());
					nt.updateTask(id, 'completed', new Date());
				}
				else
				{
					console.log('plop2');
					$(this).parent().removeClass('completed').attr('data-completed', 'false');
					nt.updateTask(id, 'completed', 'false');
				}
				nt.saveData();
			}).removeClass('event');
			
			console.log('Events loaded');
			
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
				for (task in nt.user_data.tasks)
				{
					task = nt.user_data.tasks[task];
					nt.renderTask(task);
				}
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
			for (var i = 0, c = nt.user_data.tasks.length; i < c; i++) {
				if (nt.user_data.tasks[i].id == id) {
					nt.user_data.tasks[i][field] = value;
					break;
				}
			}
		},
		
		// Render a task
		renderTask: function(task) {
			if (task.completed != 'false') {
				var completed = ' completed',
					checked = ' checked';
			}
			else {
				var completed = '',
					checked = '';
			}
			html = '<li id="task_'+task.id+'" data-id="'+task.id+'" class="list-group-item task'+completed+'" data-order='+task.order+' data-completed='+task.completed+'>' +
					'<input id="task_'+task.id+'_input" class="event" type="checkbox"'+checked+'> ' +
					'<label for="task_'+task.id+'_input">'+ task.name + '</label>' +
					'<span class="pull-right deleteTask pointer event"><i class="fa fa-trash-o"></i></span>' +
				'</li>';
			$("#task-list").append(html);
			nt.loadEvents();
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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

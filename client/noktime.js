
	var nt = {
		
		appVersion: '0.2',
		
		user_id: null,
		user_data: {
			tasks: []
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
			
			/* LOAD EVENTS */
			
			// Create new task
			$('#createTask').submit( function(event) {
				event.preventDefault();
				var task = {};
				task.id = nt.makeUid(),
				task.name = $(this).find('input').val();
				task.created = new Date();
				nt.user_data.tasks.push(task);
				nt.renderTask(task.id, task.name);
				nt.saveData();
			});
			
			// Delete task
			$('.deleteTask').click( function() {
				var delete_id = $(this).parent().data('task_id');
			});
		
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
			
			// Load default page at startup
			nt.loadPage('tasks');
			
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
				for (var i = 0, c = nt.user_data.tasks.length; i < c; i++)
				{
					var t = nt.user_data.tasks[i];
					nt.renderTask(t.id, t.name);
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
		
		// Render a task
		renderTask: function(task_id, task_name) {
			html = '<li id="task_'+task_id+'" data-task_id="'+task_id+'" class="list-group-item">' +
					'<input  id="'+task_id+'_input" type="checkbox"> ' +
					'<label for="'+task_id+'_input">'+ task_name + '</label>' +
					'<span class="pull-right deleteTask"><i class="fa fa-trash-o"></i></span>' +
				'</li>';
			$("#task-list").append(html);
		}
	}

	$(function() {
		
		

		nt.initialize();
		
		$(".sortable").sortable();
		
		
		
	});
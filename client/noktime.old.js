
	var appVersion = 0.1;
	var dbVersion = 3;
	
	$(".app-version").html(appVersion);

	// Random ID
	function makeId()
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		
		for (var i=0; i < 8; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));
			
		return text;
	}

	// Load a page
	function loadPage(page)
	{
		// Show page and hide others
		$('.page').hide();
		$('#'+page).show();
		
		// Activate tab and deactivate others
		$('.active').removeClass('active');
		$('#tab-'+page).addClass('active');
	}
	
	// Create task in HTML list
	function createTask(task_id,task_name) {
		html = '<li id="'+task_id+'" data-task_id="'+task_id+'" class="list-group-item">' +
					'<input  id="'+task_id+'_input" type="checkbox"> ' +
					'<label for="'+task_id+'_input">'+ task_name + '</label>' +
					'<span class="pull-right deleteTask"><i class="fa fa-trash-o"></i></span>' +
				'</li>';
		$("#task-list").append(html);
	}

	$(function() {
		
		// Open SQL Lite database
		html5sql.openDatabase("courses", "courses", 1*1024*1024);
		
		// Check database version and delete if obsolete
		if(dbVersion != localStorage.getItem("dbVersion")) {
			html5sql.process("DROP TABLE IF EXISTS `tasks`");
			localStorage.setItem("dbVersion",dbVersion);
		}
		
		// Create database if not exists
		html5sql.process("CREATE TABLE IF NOT EXISTS `tasks` (task_id REAL UNIQUE, task_name VARCHAR(128), task_order INT UNSIGNED DEFAULT 0, task_insert DATETIME, task_update DATETIME DEFAULT NULL, task_done DATETIME DEFAULT NULL)");
		
		// Read tasks from database
		html5sql.process(
            ["SELECT * FROM `tasks`;"],
            function(transaction, results, rows) {
                for(var i = 0; i < rows.length; i++) {
					createTask(rows[i].task_id,rows[i].task_name);
                }
            },
            function(error, statement){
                errors.append("<li>"+error.message+" Occured while processing: "+statement+"</li>");
            }
		);
		
		// Default page
		loadPage('tasks');
		
		$(".sortable").sortable();
		
		// Change page
		$('a').click( function(event) {
			var href = $(this).attr('href');
			if (href.indexOf('#') != -1)
			{
				var page = href.replace('#','');
				loadPage(page);
			}
			else
			{
				if (navigator.onLine) window.location = href;
			}
		});
		
		// Create task
		$('#create-task').submit( function(event) {
			event.preventDefault();
			var task_id = 't'+makeId();
			var task_name = $(this).find('input').val();
			html5sql.process("INSERT INTO `tasks`(`task_id`,`task_name`) VALUES('"+task_id+"','"+task_name+"')");
			createTask(task_id,task_name);
		});
		
		// Delete task
		$('#deleteTask').click( function() {
			var delete_id = $(this).parent().data('task_id');
			//html5sql.process("DELETE FROM `tasks` WHERE `task_id` = "'+delete_id+'" LIMIT 1");
		});
		
		
		
	});